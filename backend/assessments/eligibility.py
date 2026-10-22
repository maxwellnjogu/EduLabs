"""
Authoritative readiness-test eligibility rules (server-side).

A student may take the final readiness test only when every published lab in
the unit/semester has a passing attempt, AND every lab flagged
`readiness_gate` (e.g. SDLC) has a *genuine* (non-demo) passing attempt.
Synthetic demo history never satisfies a gate lab.
"""
from .models import Assessment, AssessmentAttempt


def get_readiness_status(student, unit, semester):
    # The curriculum requires 14 weekly labs (weeks 1 to 14).
    labs = list(
        Assessment.objects.filter(
            unit=unit,
            semester=semester,
            assessment_type=Assessment.AssessmentType.LAB,
            week__week_number__gte=1,
            week__week_number__lte=14,
        ).order_by("week__week_number", "id")
    )
    if not labs:
        labs = list(
            Assessment.objects.filter(
                unit=unit,
                semester=semester,
                assessment_type=Assessment.AssessmentType.LAB,
                status=Assessment.Status.PUBLISHED,
            ).order_by("week__week_number", "id")
        )

    passed_attempts = AssessmentAttempt.objects.filter(
        student=student,
        assessment__in=labs,
        is_completed=True,
        passed=True,
    )
    any_pass_ids = set(passed_attempts.values_list("assessment_id", flat=True))
    genuine_pass_ids = set(
        passed_attempts.filter(is_demo_data=False).values_list("assessment_id", flat=True)
    )

    completed_ids = set()
    outstanding = []
    for lab in labs:
        done = lab.id in (genuine_pass_ids if lab.readiness_gate else any_pass_ids)
        if done:
            completed_ids.add(lab.id)
        else:
            outstanding.append(lab)

    total = len(labs)
    completed = len(completed_ids)
    unlocked = total > 0 and not outstanding

    next_lab = None
    if outstanding:
        gate = [lab for lab in outstanding if lab.readiness_gate]
        pick = (gate or outstanding)[0]
        next_lab = {
            "id": pick.id,
            "title": pick.title,
            "week_id": pick.week_id,
            "week_number": pick.week.week_number if pick.week else None,
            "is_readiness_gate": pick.readiness_gate,
        }

    if unlocked:
        reason = "All required labs are complete, including the SDLC lab. The readiness test is unlocked."
    elif next_lab and next_lab["is_readiness_gate"]:
        reason = (
            f"Locked: you must pass the \"{next_lab['title']}\" lab before the "
            f"Readiness Test unlocks ({completed}/{total} labs complete)."
        )
    elif next_lab:
        reason = f"Locked: {completed}/{total} labs complete. Next required lab: {next_lab['title']}."
    else:
        reason = "Locked: no published labs are configured for this unit yet."

    return {
        "unlocked": unlocked,
        "labs_completed": completed,
        "total_labs": total,
        "next_required_lab": next_lab,
        "reason": reason,
    }
