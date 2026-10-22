import os
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from academics.models import Unit, LecturerAssignment, AcademicSemester
from security.permissions import IsLecturer
from security.utils import validate_and_save_upload, log_audit_trail
from .models import (
    LearningWeek,
    LearningMaterial,
    RevisionResource,
    LecturerRecommendedTopic,
)
from .serializers import (
    LearningWeekSerializer,
    LearningMaterialSerializer,
    RevisionResourceSerializer,
    LecturerRecommendedTopicSerializer,
)
from academics.serializers import UnitSerializer, AcademicSemesterSerializer
from assessments.models import Assessment, AssessmentAttempt


class LecturerDashboardView(views.APIView):
    """
    Lecturer overview:
    Assigned units, active semester, published materials count, assessment activity,
    and student pass/fail statistics.
    """
    permission_classes = [IsLecturer]

    def get(self, request):
        lecturer = request.user

        # Get assigned units
        assignments = LecturerAssignment.objects.filter(
            lecturer=lecturer,
            is_active=True,
        ).select_related("unit", "semester")

        units_list = []
        total_attempts = 0
        total_passed = 0
        students_needing_retakes = 0

        for a in assignments:
            unit = a.unit
            materials_count = LearningMaterial.objects.filter(week__unit=unit, is_published=True).count()
            published_assessments = Assessment.objects.filter(unit=unit, status=Assessment.Status.PUBLISHED).count()

            # Attempts for this unit
            attempts = AssessmentAttempt.objects.filter(assessment__unit=unit, is_completed=True)
            u_attempts_count = attempts.count()
            u_passed_count = attempts.filter(passed=True).count()

            total_attempts += u_attempts_count
            total_passed += u_passed_count

            # Students with latest attempt failed
            failed_attempts = attempts.filter(passed=False).values("student").distinct().count()
            students_needing_retakes += failed_attempts

            units_list.append(
                {
                    "id": unit.id,
                    "code": unit.code,
                    "name": unit.name,
                    "semester": a.semester.name if a.semester else "Semester 1",
                    "published_materials": materials_count,
                    "published_assessments": published_assessments,
                    "total_attempts": u_attempts_count,
                    "passed_attempts": u_passed_count,
                }
            )

        pass_rate = round((total_passed / total_attempts * 100.0), 1) if total_attempts > 0 else 0.0

        return Response(
            {
                "lecturer_name": lecturer.get_full_name() or lecturer.username,
                "assigned_units": units_list,
                "metrics": {
                    "total_assigned_units": len(units_list),
                    "total_student_attempts": total_attempts,
                    "total_passed_attempts": total_passed,
                    "pass_rate_percentage": pass_rate,
                    "students_needing_retakes": students_needing_retakes,
                },
            }
        )


class LecturerUnitsView(views.APIView):
    """Lists units assigned to current lecturer."""
    permission_classes = [IsLecturer]

    def get(self, request):
        assignments = LecturerAssignment.objects.filter(
            lecturer=request.user,
            is_active=True,
        ).select_related("unit", "semester")

        units_data = []
        for a in assignments:
            u_data = UnitSerializer(a.unit).data
            u_data["semester_name"] = a.semester.name if a.semester else "Semester 1"
            u_data["semester_id"] = a.semester.id if a.semester else None
            units_data.append(u_data)

        return Response(units_data)


class LecturerWeeksView(views.APIView):
    """
    Returns the 14 week slots for an assigned unit.
    Lecturer can inspect which weeks are published and manage content.
    """
    permission_classes = [IsLecturer]

    def get(self, request, unit_id):
        # Verify assignment
        assignment = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit_id=unit_id,
            is_active=True,
        ).first()

        if not assignment and not request.user.is_admin_user:
            return Response(
                {"error": "Access Denied: You are not assigned to manage this academic unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        weeks = LearningWeek.objects.filter(unit_id=unit_id).order_by("week_number")
        weeks_data = []
        for w in weeks:
            mat_count = w.materials.count()
            lab = Assessment.objects.filter(week=w).first()
            weeks_data.append(
                {
                    "id": w.id,
                    "week_number": w.week_number,
                    "title": w.title,
                    "description": w.description,
                    "is_published": w.is_published,
                    "materials_count": mat_count,
                    "has_lab": lab is not None,
                    "lab_id": lab.id if lab else None,
                    "lab_title": lab.title if lab else None,
                    "lab_status": lab.status if lab else None,
                }
            )

        return Response(
            {
                "unit": UnitSerializer(assignment.unit).data if assignment else None,
                "weeks": weeks_data,
            }
        )

    def post(self, request, unit_id):
        assignment = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit_id=unit_id,
            is_active=True,
        ).first()

        if not assignment and not request.user.is_admin_user:
            return Response(
                {"error": "Access Denied: You are not assigned to manage this academic unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        
        last_week = LearningWeek.objects.filter(unit_id=unit_id).order_by("-week_number").first()
        next_week_num = (last_week.week_number + 1) if last_week else 1
        week_num = int(request.data.get("week_number", next_week_num))

        week = LearningWeek.objects.create(
            unit_id=unit_id,
            week_number=week_num,
            title=title or f"Week {week_num}: Advanced Curriculum Module",
            description=description or "Interactive curriculum module created by faculty.",
            is_published=True,
        )

        return Response(
            {
                "id": week.id,
                "week_number": week.week_number,
                "title": week.title,
                "description": week.description,
                "is_published": week.is_published,
                "materials_count": 0,
                "has_lab": False,
            },
            status=status.HTTP_201_CREATED,
        )



from .material_service import process_uploaded_material


class LecturerMaterialsView(views.APIView):
    """
    Allows lecturer to upload PDFs, DOCX, TXT, images, add video references, or create lecture notes.
    Performs server-side file validation, safe text extraction, and stores metadata in PostgreSQL.
    """
    permission_classes = [IsLecturer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, week_id=None):
        if not week_id:
            week_id = request.query_params.get("week_id") or request.query_params.get("week")

        if week_id:
            try:
                week = LearningWeek.objects.get(id=week_id)
            except LearningWeek.DoesNotExist:
                return Response({"error": "Week not found."}, status=status.HTTP_404_NOT_FOUND)
            materials = week.materials.all().order_by("-created_at")
        else:
            assessment_id = request.query_params.get("assessment_id")
            if assessment_id:
                materials = LearningMaterial.objects.filter(assessment_id=assessment_id).order_by("-created_at")
            else:
                unit_id = request.query_params.get("unit_id")
                if unit_id:
                    materials = LearningMaterial.objects.filter(week__unit_id=unit_id).order_by("-created_at")
                else:
                    materials = LearningMaterial.objects.filter(uploaded_by=request.user).order_by("-created_at")

        return Response(LearningMaterialSerializer(materials, many=True, context={"request": request}).data)

    def post(self, request, week_id=None):
        target_week_id = week_id or request.data.get("week") or request.data.get("week_id")
        target_assessment_id = request.data.get("assessment") or request.data.get("assessment_id")

        week = None
        assessment = None

        if target_assessment_id:
            try:
                assessment = Assessment.objects.select_related("unit", "week").get(id=target_assessment_id)
                if not target_week_id and assessment.week:
                    week = assessment.week
            except Assessment.DoesNotExist:
                return Response({"error": "Specified assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        if not week and target_week_id:
            try:
                week = LearningWeek.objects.select_related("unit").get(id=target_week_id)
            except LearningWeek.DoesNotExist:
                return Response({"error": "Specified learning week not found."}, status=status.HTTP_404_NOT_FOUND)

        if not week and assessment and assessment.week:
            week = assessment.week

        if not week:
            return Response({"error": "A valid week or assessment must be provided for material upload."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify lecturer assignment
        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=week.unit,
            is_active=True,
        ).exists()

        if not is_assigned and not request.user.is_admin_user:
            return Response({"error": "Access Denied: You are not assigned to manage materials for this unit."}, status=status.HTTP_403_FORBIDDEN)

        material_type = request.data.get("material_type", "notes")
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        content = request.data.get("content", "").strip() or request.data.get("content_text", "").strip()
        url = request.data.get("url", "").strip() or request.data.get("youtube_url", "").strip()
        uploaded_file = request.FILES.get("file")

        if not title:
            if uploaded_file:
                title = os.path.splitext(uploaded_file.name)[0].replace("_", " ").title()
            else:
                return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate uploaded file format and header upfront
        if uploaded_file:
            from rest_framework.exceptions import ValidationError
            try:
                validate_and_save_upload(uploaded_file, upload_subdir="materials")
            except ValidationError as ve:
                err_msg = ve.detail[0] if isinstance(ve.detail, list) and ve.detail else str(ve.detail)
                return Response({"error": err_msg}, status=status.HTTP_400_BAD_REQUEST)

        # If a file is uploaded, infer extension-based material_type if default
        if uploaded_file and material_type == "notes":
            file_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if file_ext == ".pdf":
                material_type = LearningMaterial.MaterialType.PDF
            elif file_ext == ".docx":
                material_type = LearningMaterial.MaterialType.DOCX
            elif file_ext == ".txt":
                material_type = LearningMaterial.MaterialType.TXT
            elif file_ext in [".png", ".jpg", ".jpeg", ".webp"]:
                material_type = LearningMaterial.MaterialType.IMAGE

        material = LearningMaterial(
            week=week,
            assessment=assessment,
            uploaded_by=request.user,
            title=title,
            description=description,
            material_type=material_type,
            file=uploaded_file,
            url=url,
            content=content,
            is_published=True,
        )
        material.save()

        # Process and extract text
        process_uploaded_material(material, uploaded_file)

        # Ensure week is published
        if not week.is_published:
            week.is_published = True
            week.published_at = timezone.now()
            week.save()

        log_audit_trail(
            request,
            "UPLOAD_MATERIAL",
            "LearningMaterial",
            material.id,
            {"title": title, "type": material_type, "status": material.processing_status},
        )

        return Response(
            LearningMaterialSerializer(material, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class LecturerMaterialDetailView(views.APIView):
    """Edit, publish/unpublish, or delete learning material with ownership validation."""
    permission_classes = [IsLecturer]

    def _check_permission(self, request, material):
        if request.user.is_admin_user:
            return True
        if material.uploaded_by == request.user:
            return True
        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=material.week.unit,
            is_active=True,
        ).exists()
        return is_assigned

    def patch(self, request, material_id):
        try:
            mat = LearningMaterial.objects.select_related("week__unit", "uploaded_by").get(id=material_id)
        except LearningMaterial.DoesNotExist:
            return Response({"error": "Material not found."}, status=status.HTTP_404_NOT_FOUND)

        if not self._check_permission(request, mat):
            return Response({"error": "Access Denied: You do not have permission to modify this material."}, status=status.HTTP_403_FORBIDDEN)

        serializer = LearningMaterialSerializer(mat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, material_id):
        try:
            mat = LearningMaterial.objects.select_related("week__unit", "uploaded_by").get(id=material_id)
        except LearningMaterial.DoesNotExist:
            return Response({"error": "Material not found."}, status=status.HTTP_404_NOT_FOUND)

        if not self._check_permission(request, mat):
            return Response({"error": "Access Denied: You cannot delete materials belonging to other instructors or unassigned units."}, status=status.HTTP_403_FORBIDDEN)

        mat_id = mat.id
        if mat.file:
            try:
                mat.file.delete(save=False)
            except Exception as e:
                logger.warning("Error deleting file on disk for material %s: %s", mat_id, str(e))

        mat.delete()
        log_audit_trail(request, "DELETE_MATERIAL", "LearningMaterial", mat_id)
        return Response({"message": "Material removed successfully."})



class LecturerRevisionPackView(views.APIView):
    """Manage unit revision pack and lecturer recommended topics."""
    permission_classes = [IsLecturer]

    def get(self, request, unit_id):
        resources = RevisionResource.objects.filter(unit_id=unit_id).order_by("-created_at")
        topics = LecturerRecommendedTopic.objects.filter(unit_id=unit_id).order_by("-priority")

        return Response(
            {
                "revision_resources": RevisionResourceSerializer(resources, many=True, context={"request": request}).data,
                "recommended_topics": LecturerRecommendedTopicSerializer(topics, many=True).data,
            }
        )

    def post(self, request, unit_id):
        # Create recommended topic
        title = request.data.get("title", "").strip()
        desc = request.data.get("description", "").strip()
        priority = request.data.get("priority", "high")
        rationale = request.data.get("rationale", "").strip()

        if not title:
            return Response({"error": "Topic title is required."}, status=status.HTTP_400_BAD_REQUEST)

        topic = LecturerRecommendedTopic.objects.create(
            unit_id=unit_id,
            semester=AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first(),
            title=title,
            description=desc,
            priority=priority,
            rationale=rationale,
            is_in_final_test=True,
        )

        return Response(LecturerRecommendedTopicSerializer(topic).data, status=status.HTTP_201_CREATED)
