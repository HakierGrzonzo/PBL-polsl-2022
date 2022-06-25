import sys
import json
from datetime import date, timedelta
from datetime import time as Time
from jinja2 import Template
from collections import defaultdict
from os import mkdir
import subprocess
import random

def format_time_string(hour: int, minutes: int = 0):
    return Time(hour=hour, minute=minutes).isoformat("minutes")

badwords = ["create", "update", "merge", "initial", 'new']

months = ["Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec"]

start = date(2022, 3, 1)
end = date(2022, 6, 30)
celebrations = [date(2022, 5, 3)]

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

def get_allowed_days():
    res = []
    day = start
    while day < end:
        if day.weekday() not in [1, 2] or day in celebrations:
            res.append(day)
        day += timedelta(days=1)
    return res

def get_time_in_meetings():
    time = 0
    day = start
    while day < end:
        if day in celebrations:
            pass
        elif day.weekday() == 1:
            time += 3
        elif day.weekday() == 2:
            time += 2
        day += timedelta(days=1)
    return time

hours = (320) - get_time_in_meetings()

hardcoded_logs = {
        date(2022, 4, 5): ('Spotkanie: Krajobraz dźwiękowy - percepcja wrażeń dźwiękowych w środowisku. Fizyczne i subiektywne cechy dźwięku.', '15:00', '18:00'),
        date(2022, 4, 6): ('Spotkanie: Klient api. Wstępna konteneryzacja backendu. Dodawanie panelu wyświetlania wyników pomiarów.', '14:30', '16:30'),
        date(2022, 4, 12): ('Spotkanie: Gromadzenie danych akustycznych. Pomiary w terenie. Testy aplikacji do gromadzenia i przetwarzania danych akustycznych.', '15:00', '18:00'),
        date(2022, 4, 13): ('Spotkanie: Przygotowanie frontendu do backendu do wersji 0.10. Przygotowanie edytora do konteneryzacji.', '14:30', '16:30'),
        date(2022, 4, 20): ('Spotkanie: Finalizacja procesu konteneryzacji frontendu.', '14:30', '16:30'),
        date(2022, 4, 26): ('Spotkanie: Środowisko bazoodanowe wykorzystywane do gromadzenia danych akustycznych.', '15:00', '18:00'),
        date(2022, 4, 27): ('Spotkanie: Tworzenie deweloperskiego proxy. Implementacja elementów lokalizacyjnych.', '14:30', '16:30'),
}

for author, commits in commits_by_author.items():
    dir_name = author.replace(" ", "_")
    time_per_commit = list([timedelta(hours=1) for _ in range(0, len(commits))])
    hours_distributed = len(commits)
    while hours_distributed < hours :
        random_index = random.randint(0, len(commits) - 1)
        time_per_commit[random_index] += timedelta(hours=1)
        hours_distributed += 1
    days_to_log = {
        x: (commit_msg, time)
        for x, commit_msg, time in zip(
            sorted(random.sample(get_allowed_days(), len(commits))),
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
            time = round(time.total_seconds() // 3600)
            start_time = 8
            if time < 5:
                start_time = random.randint(8, 11)
            last_month["commits"].append(
                {
                    "day": day.day,
                    "start": format_time_string(start_time),
                    "stop": format_time_string(start_time + time),
                    "hours": time,
                    "msg": msg,
                }
            )
        elif day.weekday() == 1:
            msg, _start, _stop = hardcoded_logs.get(day, ('Spotkanie projektowe', format_time_string(15), format_time_string(18)))
            last_month["commits"].append(
                {
                    "day": day.day,
                    "start": _start,
                    "stop": _stop,
                    "hours": "3",
                    "msg": msg,
                }
            )
        elif day.weekday() == 2:
            msg, _start, _stop = hardcoded_logs.get(day, ('Spotkanie z doktorem Sobotą', format_time_string(14, 30), format_time_string(16, 30)))
            last_month["commits"].append(
                {
                    "day": day.day,
                    "start": _start,
                    "stop": _stop,
                    "hours": "2",
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
    #print(p.stderr.decode())
