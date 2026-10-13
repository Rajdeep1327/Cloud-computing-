def verify_run(run_data: dict) -> dict:
    claims = run_data.get("claims", [])
    events = run_data.get("tool_events", [])
    expected = run_data.get("expected_actions", [])
    logging_complete = run_data.get("logging_complete", False)

    results = []

    for claim in claims:
        action = claim.get("action")
        target = claim.get("target")

        matching = [
            e for e in events
            if e.get("action") == action
            and e.get("target") == target
        ]

        successful = [e for e in matching if e.get("status") == "success"]
        failed = [e for e in matching if e.get("status") == "failed"]

        if successful and not failed:
            status = "VERIFIED"
            evidence = [e.get("event_id") for e in successful]
            explanation = "Successful tool event supports the claim."

        elif failed and not successful:
            status = "CONTRADICTED"
            evidence = [e.get("event_id") for e in failed]
            explanation = "Tool event records a failure."

        elif successful and failed:
            status = "UNVERIFIED"
            evidence = [e.get("event_id") for e in matching]
            explanation = "Conflicting events make the result inconclusive."

        else:
            was_expected = any(
                item.get("action") == action
                and item.get("target") == target
                for item in expected
            )

            if logging_complete and was_expected:
                status = "CONTRADICTED"
                evidence = []
                explanation = "Complete logs show no event for an expected action."
            else:
                status = "UNVERIFIED"
                evidence = []
                explanation = "Available logs cannot establish whether the action occurred."

        results.append({
            "claim_id": claim.get("claim_id", "unknown"),
            "status": status,
            "evidence": evidence,
            "explanation": explanation
        })

    summary = {
        "total": len(results),
        "verified": sum(r["status"] == "VERIFIED" for r in results),
        "contradicted": sum(r["status"] == "CONTRADICTED" for r in results),
        "unverified": sum(r["status"] == "UNVERIFIED" for r in results)
    }

    return {
        "run_id": run_data.get("run_id", "unknown"),
        "results": results,
        "summary": summary
    }
