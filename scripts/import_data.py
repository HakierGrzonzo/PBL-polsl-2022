from pprint import pprint
import psycopg2

con = psycopg2.connect(
    host="xeonserv.grzegorzkoperwas.site",
    port=2138,
    database="pbl",
    user="foo",
    password="whatever",
)


def objectify(name, tag, score, dev):
    return {"name": name, "tag": tag, "score": float(score), "dev": float(dev)}


with open("./raw_data.txt") as f:
    items = {
        item["name"]: item
        for item in [
            objectify(*[field.strip() for field in row.split(";")])
            for row in f.readlines()
        ]
    }
    pprint(items)
    with con.cursor() as cursor:
        cursor.execute("BEGIN TRANSACTION;")
        cursor.execute(
            """
SELECT ID,
	TITLE
FROM PUBLIC."Measurements";
        """
        )
        for row in cursor.fetchall():
            row_id, name = row
            item = items.get(name.strip())
            if item:
                print(item, row_id)
                cursor.execute(
                    f"""
UPDATE public."Measurements"
    SET 
        SCORE = {item['score']},
        DEVIATION = {item['dev']},
        TAGS = '{item["tag"]}'
    WHERE
        ID = {row_id}
                """
                )
            else:
                print(f"[ERROR] no data for {name}")
        cursor.execute('SELECT * FROM PUBLIC."Measurements";')
        pprint(cursor.fetchall())
        input("proceed?")
        cursor.execute("COMMIT;")
