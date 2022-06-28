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
celebrations = [date(2022, 5, 3), date(2022, 6, 1), date(2022, 6, 28), date(2022, 6, 29)]

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
        date(2022, 3, 1): ('Wprowadzenie do tematyki akustyki i pomiarów akustycznych.', '15:00', '18:00'),
        date(2022, 3, 2): ('Wprowadzenie do możliwego do zastosowania stosu technologicznego.', '14:30', '16:30'),
        date(2022, 3, 8): ('Omówienie uwarunkowań pomiarów w środowisku miejskim. Sposoby rejestracji sygnałów fonicznych.', '15:00', '18:00'),
        date(2022, 3, 9): ('Dobór narzędzi i środowisk niezbędnych do realizacji projektu.', '14:30', '16:00'),
        date(2022, 3, 15): ('Wprowadzenie do technologii Mobile GIS. Opracowanie karty pomiarowej.', '15:00', '18:00'),
        date(2022, 3, 16): ('Przygotowanie środowiska bazodanowego do zbierania danych pomiarowych.', '14:30', '16:00'),
        date(2022, 3, 22): ('Zapoznanie się ze sprzętem pomiarowym', '15:00', '18:00'),
        date(2022, 3, 23): ('Dostosowanie środowiska gromadzenia i przetwarzania danych do warunków technicznych sprzętu pomiarowego.', '14:30', '16:00'),
        date(2022, 3, 29): ('Określenie warunków środowiskowych umożliwiających realizację badań środowiskowych. Opracowanie harmonogramu realizacji badań środowiskowych.', '15:00', '18:00'),
        date(2022, 3, 30): ('Testy środowiska informatycznego.', '14:30', '16:30'),
        date(2022, 4, 5): ('Spotkanie: Krajobraz dźwiękowy - percepcja wrażeń dźwiękowych w środowisku. Fizyczne i subiektywne cechy dźwięku.', '15:00', '18:00'),
        date(2022, 4, 6): ('Spotkanie: Klient api. Wstępna konteneryzacja backendu. Dodawanie panelu wyświetlania wyników pomiarów.', '14:30', '16:30'),
        date(2022, 4, 12): ('Spotkanie: Gromadzenie danych akustycznych. Pomiary w terenie. Testy aplikacji do gromadzenia i przetwarzania danych akustycznych.', '15:00', '18:00'),
        date(2022, 4, 13): ('Spotkanie: Przygotowanie frontendu do backendu do wersji 0.10. Przygotowanie edytora do konteneryzacji.', '14:30', '16:30'),
        date(2022, 4, 20): ('Spotkanie: Finalizacja procesu konteneryzacji frontendu.', '14:30', '16:30'),
        date(2022, 4, 26): ('Spotkanie: Środowisko bazoodanowe wykorzystywane do gromadzenia danych akustycznych.', '15:00', '18:00'),
        date(2022, 4, 27): ('Spotkanie: Tworzenie deweloperskiego proxy. Implementacja elementów lokalizacyjnych.', '14:30', '16:30'),
        date(2022, 5, 10): ('Wprowadzenie do technologii GIS. Przedstawienie zasad budowy warstw tematycznych w oprogramowaniu QGIS. Podłączenie podkładów mapowych z geoportalu. Przygotowanie warstw tematycznych dla wytypowanego obszaru badań. Eksport punktów pomiarowych z oprogramowania Mobile GIS i wykorzystanie ich do budowy mapy webowej.', '15:00', '18:00'),
        date(2022, 5, 11): (' Podstawowe, podbudowane teoretycznie, metody, techniki i narzędzia stosowane w rozwiązywaniu zadań informatycznych w oparciu o bazy danych.', '14:30', '16:30'),
        date(2022, 5, 17): ('Opracowanie modelu oceny krajobrazu dźwiękowego. Testy psychoakustyczne. Ekstrakcja cech dźwięku z sygnału akustycznego.', '15:00', '18:00'),
        date(2022, 5, 18): ('Teoretyczne podstawy reprezentacji obrazów cyfrowych, a także różne metody ich analizy i przetwarzania (bezkontekstowe, kontekstowe).', '14:30', '16:30'),
        date(2022, 5, 24): ('Opracowanie sposobu przeprowadzenia ocen wrażeń dźwiękowych', '15:00', '18:00'),
        date(2022, 5, 25): ('Podstawowe założenia programowania obiektowego, hermetyzację, dziedziczeni i polimorfizm.', '14:30', '16:30'),
        date(2022, 5, 31): ('Konfiguracja okienek \'Pop-Up\' pojawiających się na mapie webowej po najechaniu kursorem. Opracowanie gotowej mapy - przystosowanej do publikacji w sieci oraz do wydruku w formie papierowej.', '15:00', '18:00'),
        date(2022, 6, 7): ('Analiza otrzymanych wyników z przeprowadzonych pomiarów i testów psychoakustycznych.', '15:00', '18:00'),
        date(2022, 6, 8): ('Tworzenie klas zgodnie z zasadą hermetyzacji, wykorzystanie polimorfizmu i dziedziczenia. Interaktywny interfejs graficzny użytkownika.', '14:30', '16:30'),
        date(2022, 6, 14): ('Opis środowiska przygotowanego do gromadzenia, przetwarzania i prezentacji danych akustycznych. Testy.', '15:00', '18:00'),
        date(2022, 6, 15): ('Implementacja w środowisku MATLAB prostych przekształceń obrazów cyfrowych, budowa prostych algorytmów ich przetwarzania.', '14:30', '16:30'),
        date(2022, 6, 21): ('Integracja webowego portalu map cyfrowych z portalem udostępniającym wyniku projektu (to wymaga obgadania wcześniej szczegółów technicznych). Podsumowanie oraz ocena osiągniętych celów i wyników projektu.', '15:00', '18:00'),
        date(2022, 6, 22): ('Interpretacja wyników otrzymanych podczas analizy i przetwarzania obrazów cyfrowych.', '14:30', '16:30'),
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
            sorted(random.sample(get_allowed_days(), min(
                len(commits),
                len(get_allowed_days()),
            ))),
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
