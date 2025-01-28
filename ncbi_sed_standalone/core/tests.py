from django.test import TestCase, Client
from django.urls import reverse

class DomensTest(TestCase):
    def test_should_respond_only_for_core(self):
        client = Client(HTTP_HOST="www.nsed")
        view = reverse("index")
        response = client.get(view)
        self.assertEqual(response.status_code, 200)

    def test_should_not_respond_for_appcontroll(self):
        client = Client(HTTP_HOST="www.appcontroll.nsed")
        view = reverse("index")
        response = client.get(view)
        self.assertEqual(response.status_code, 404)
