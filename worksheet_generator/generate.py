import sys
import json
from datetime import datetime
from jinja2 import Template
from collections import defaultdict
from os import mkdir
import subprocess
import random

badwords = ["create", "update", "merge", "initial"]

months = ["Marzec", "Kwiecień", "Maj", "Czerwiec"]

log = json.load(sys.stdin)
commits_by_author = defaultdict(lambda: list())

for commit in log:
    name = " ".join(commit["author"].split(" ")[:-1]).strip()
    if not any(x in commit["message"].lower() for x in badwords):
        commits_by_author[name].append(commit)

template = Template(open("template.tex").read())

for author, commits in commits_by_author.items():
    commits = list(reversed(commits))
    commits_per_month = len(commits) // len(months)
    commit_ranges = list(
        [
            range(i * commits_per_month, commits_per_month * (i + 1))
            for i in range(0, 3)
        ]
    ) + [range(commits_per_month * 3, len(commits))]
    data = [
        {
            "name": months[i],
            "commits": [
                {
                    "day": str(day),
                    "start": r"\#",
                    "stop": r"\#",
                    "hours": r"\#",
                    "msg": commits[j]["message"].replace("_", r"\_"),
                }
                for j, day in zip(
                    r, sorted(random.sample(range(1, 31), len(r)))
                )
            ],
        }
        for i, r in enumerate(commit_ranges)
    ]
    dir_name = author.replace(" ", "_")
    try:
        mkdir(dir_name)
    except:
        pass
    print(data)
    subprocess.run(
        ["xelatex", f"-output-directory={dir_name}", "--"],
        input=template.render(author_name=author, data=data).encode(),
    )
