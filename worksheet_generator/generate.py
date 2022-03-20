import sys
import json
from datetime import datetime
from jinja2 import Template
from collections import defaultdict
from os import mkdir
import subprocess

log = json.load(sys.stdin)
commits_by_author = defaultdict(lambda: list())

for commit in log:
    name = " ".join(commit["author"].split(" ")[:-1]).strip()
    commits_by_author[name].append(commit)

template = Template(open("template.tex").read())

for author, commits in commits_by_author.items():
    data = []
    data.append(
        {
            "name": "Marzec",
            "commits": [
                {
                    "day": datetime.fromisoformat(commit["date"]).day,
                    "start": 2,
                    "stop": 3,
                    "hours": 1,
                    "msg": commit["message"].replace("_", "\\_"),
                }
                for commit in reversed(commits)
            ],
        }
    )
    dir_name = author.replace(" ", "_")
    try:
        mkdir(dir_name)
    except:
        pass
    subprocess.run(
        ["xelatex", f"-output-directory={dir_name}", "--"],
        input=template.render(author_name=author, data=data).encode(),
    )
