from pycades import pycades
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class PycadesVersion(APIView):
    def get(self, request):
        version = pycades.ModuleVersion()
        return Response({"version": version})
        
class SigningDocument(APIView):
    store = pycades.Store()
    def post(self, request):
        self.store.Open(pycades.CADESCOM_CONTAINER_STORE, pycades.CAPICOM_MY_STORE, pycades.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED)
        certs = self.store.Certificates
        assert(certs.Count != 0), "Certificates with private key not found"

        signer = pycades.Signer()
        signer.Certificate = certs.Item(1)
        signer.CheckCertificate = True

        signedData = pycades.SignedData()
        signedData.Content = "Test content to be signed"
        signature = signedData.SignCades(signer, pycades.CADESCOM_CADES_BES)

        print("--Signature--")
        print(signature)
        print("----")

        _signedData = pycades.SignedData()
        _signedData.VerifyCades(signature, pycades.CADESCOM_CADES_BES)
        print("Verified successfully")

        return Response(status=status.HTTP_400_BAD_REQUEST)
