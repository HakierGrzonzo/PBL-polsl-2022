import sys
import json
from datetime import date, timedelta
from jinja2 import Template
from collections import defaultdict
from os import mkdir
import subprocess
import random

badwords = ["create", "update", "merge", "initial"]

months = ["Marzec", "Kwiecień", "Maj", "Czerwiec"]

start = date(2022, 3, 1)
end = date(2022, 6, 30)

hours = 320

days = (end - start).days + 1

log = json.load(sys.stdin)
commits_by_author = defaultdict(lambda: list())

for commit in log:
    name = " ".join(commit["author"].split(" ")[:-1]).strip()
    commit_msg = commit["message"]
    commit_msg = commit_msg[0].upper() + commit_msg[1:]
    if (
        not any(x in commit_msg.lower() for x in badwords)
        or commit_msg in commits_by_author[name]
    ):
        commits_by_author[name].append(commit_msg)

template = Template(open("template.tex").read())

for author, commits in commits_by_author.items():
    dir_name = author.replace(" ", "_")
    time_per_commit = list([timedelta(hours=1) for _ in range(0, len(commits))])
    hours_distributed = len(commits)
    while hours_distributed < hours:
        random_index = random.randint(0, len(commits) - 1)
        time_per_commit[random_index] += timedelta(hours=1)
        hours_distributed += 1
    days_to_log = {
        start + timedelta(days=x): (commit_msg, time)
        for x, commit_msg, time in zip(
            sorted(random.sample(range(0, days), len(commits))),
            reversed(commits),
            time_per_commit,
        )
    }
    data = []
    last_month = {"month_id": start.month, "name": months[0], "commits": []}
    for day in [start + timedelta(days=x) for x in range(0, days)]:
        if last_month["month_id"] != day.month:
            data.append(last_month)
            last_month = {
                "month_id": day.month,
                "name": months[day.month - start.month],
                "commits": [],
            }
        if (val := days_to_log.get(day)) is not None:
            msg, time = val
            last_month["commits"].append(
                {
                    "day": day.day,
                    "start": r"\#",
                    "stop": r"\#",
                    "hours": round(time.total_seconds() // 3600),
                    "msg": msg,
                }
            )
        else:
            last_month["commits"].append(
                {
                    "day": day.day,
                }
            )
    data.append(last_month)
    try:
        mkdir(dir_name)
    except:
        pass
    p = subprocess.run(
        ["xelatex", f"-output-directory={dir_name}", "--"],
        input=template.render(author_name=author, data=data).encode(),
        stdout=subprocess.PIPE,
    )
