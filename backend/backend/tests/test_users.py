import datetime
import pytest
import os
from .const import const


@pytest.mark.dependency(name="create_user")
def test_create_user(client):
    response = client.post(
        "/local/register",
        json={"email": const.MAIL, "password": const.PASSWORD},
    )
    assert response.status_code == 201, response.text
    res = response.json()
    assert res["email"] == const.MAIL


@pytest.mark.dependency(depends=["create_user"])
def test_cookie_login(client):
    response = client.post(
        "/api/cookie/login",
        data={"username": const.MAIL, "password": const.PASSWORD},
    )
    assert response.status_code == 200
    assert response.cookies["ciasteczkowy_potwor"]
    response = client.get(
        "/api/users/me",
        cookies={
            "ciasteczkowy_potwor": response.cookies["ciasteczkowy_potwor"]
        },
    )
    assert response.status_code == 200
    assert response.json()["email"] == const.MAIL


@pytest.mark.dependency(name="jwt_login", depends=["create_user"])
def test_jwt_login(client):
    response = client.post(
        "/api/jwt/login",
        data={"username": const.MAIL, "password": const.PASSWORD},
    )
    assert response.status_code == 200, response.text
    token = {"Authorization": f"Bearer {response.json()['access_token']}"}
    response = client.get("/api/users/me", headers=token)
    assert response.status_code == 200
    assert response.json()["email"] == const.MAIL
    pytest.shared["token"] = token


@pytest.mark.dependency(name="create_measurements", depends=["jwt_login"])
def test_create_measurement(client):
    token = pytest.shared["token"]
    response = client.post(
        "/api/data/create",
        headers=token,
        json={
            "location": {
                "latitude": 10,
                "time": datetime.datetime.now().isoformat(),
                "longitude": 20,
            },
            "notes": "A note",
            "description": "a desc",
            "title": "a title",
            "laeq": 10,
            "tags": ["one", "two"],
        },
    )
    assert response.status_code == 201, response.text
    response = response.json()
    data = client.get(
        "/api/data/mine",
        headers=token,
    )
    assert data.status_code == 200, data.text
    data = data.json()
    assert len(data) == 1
    assert data[0] == response
    pytest.shared["measurement_id"] = data[0]["measurement_id"]


@pytest.mark.dependency(name="add_file", depends=["create_measurements"])
def test_add_file(client):
    response = client.post(
        f"/api/files/?measurement_id={pytest.shared['measurement_id']}",
        headers=pytest.shared["token"],
        files={"uploaded_file": "hello world!".encode()},
    )
    assert response.status_code == 201
    res = client.get(
        f"/api/data/{pytest.shared['measurement_id']}",
        headers=pytest.shared["token"],
    )
    assert res.status_code == 200
    assert len(res.json()["files"]) == 1
    file_id = res.json()["files"][0]["file_id"]
    assert os.path.exists(os.path.join(os.environ["FILE_PATH"], file_id))


@pytest.mark.dependency(name="delete_file", depends=["add_file"])
def test_delete_file(client):
    res = client.get(
        f"/api/data/{pytest.shared['measurement_id']}",
        headers=pytest.shared["token"],
    )
    assert res.status_code == 200
    file_id = res.json()["files"][0]["file_id"]
    response = client.delete(
        f"/api/files/delete/{file_id}", headers=pytest.shared["token"]
    )
    assert response.status_code == 204
    assert (
        os.path.exists(os.path.join(os.environ["FILE_PATH"], file_id)) == False
    )
