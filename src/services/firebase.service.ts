import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: "serial-luncher-a6f7f",
  private_key_id: "91df802e90e84040678ce93d0389b821fe066ada",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDMm4Iljy6qhBD/\njHfEzVSSgSmdTr+XA41q8Uyx44e114HcD4Vg5SZ2t3GCIicD+vOfaLMSZ15H962B\nbVI74gj+sRLSTziEUvmhXFs32MjUhH6AMd7VhHLMp5VX0/3SDQeocTRCcI5rTAsy\nExKBrEBOh9P2E3XrD9IeTjr+qV/q10y3kwfT1HspHo0eEG2B9Q/X+sCviWzeknG3\nzpKs8MPGympKmHDH83Xxqj2nStOWIDqOlSAIG174iu9n6n4xMZoB8x3EVA9U9S33\nMekhcGWsi+67K5laqw1rQhFhTvmsVsgia0KR7pjuNlfDzbH9O/56ThS1/B0vSZBj\nDH3pDduXAgMBAAECggEAApNzCOtrqeLqxRGs9yUJcdfyQOEObj8xs+bg0Wm508Zb\ng+LZvSJ1bWlm1b2w7w7LeJzPvSVHA+UjrpPEeGBV2HSjQrmTm3rhJxc4emE4Bt26\nKzDPJOU7ffi4KFIEPPV3PLdcJV/9/9TS9g9Uz527Drumcmkq6WNnTYSS0pHDiHty\nq5pkGieMSzodfHxF8Vrb9R9IqUhCXkxm3QDUzMLo4a3XS73owpvfYiEfBg/a9Ya7\nZxDJHdp+GpdTxRuNyLK7dk4HYXbS9Wk5/5MnvCjl2LUpc0szB54UU2gxcrAPnTsD\nVJGdpPkTNxpLpgF++OSY1a0AvOwQ8wzfv1mTgK6trQKBgQDvIyeE8D3mg5IoHVq7\nvPPJbiNrSDocT3BlEgn8+IkK+isb4+twbqv715LICWo+xxEG6r3uGmsNPgpbJsD1\n5Lk4Div5o/av7zv3quE0qYhO6SXHw4BJA7daP9rFVIws79vm2loSrnlWg1NX56Fo\nDEC7jw7x1Fu3vXyJcN7t14e0awKBgQDbCQearBjgi5uAFrham3W2vDwc6ixk5QYT\nSR/VN+SHQN8qqfCTmFiTM6f28Mll3xJjc+CSEU3qkgDDCCDJGNZIAKgee1VEhHmy\npu1a2+0NHMC7UbFbUV1FD4E324Tew+r9tRxyElVGVXGstWBD3RJt/gGLVweZcJ1X\nDJMA1O9ghQKBgQCMxjEZfSOzc3iyzLUBF7abuY54NUigKdOMbBYdKWHjaGnAPWf4\nA+6SjtEFmSVGV4GahM3SQRML9J28ExA8sKyoZw9UIkWyRC8VGS8CBVsMuQtYkaoP\nUXS6WCS9TYxHV9woBhpILRWY7C4/7UeDLNNellTB37UucQnDDwLtGJf2iQKBgQDa\niYvYutSnVSN1DTYq0OkFxZGEl/BrSkZhf5gPOJD+ka8X9i5eVKYrWGLBc0S+K29B\nYyAxHKrM25d+/+EWQ32ooV8b6poMntB9eydefAdsCcASJVP7dJbGjM20WYWcbYVM\nVSNofPowDpg4ZU8C5tO4grIvwEmIwl95tsYFEm8zsQKBgD5UXQxU7aEZ1EvprQJx\nSEBUz7atxYHDBc3sWrUg5eknXJZhzarniV8F09PKPWQ5fBAHp78QvDTlaycysONr\nuX9QcxeEwjAymgid9S8fPmovp1mknWA6uhiZ2z52dks4669+l6VfC9RKFaQ9OhJk\niJOC/1tmt41I0BsePrn/Nj1B\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-drw6s@serial-luncher-a6f7f.iam.gserviceaccount.com",
  client_id: "104026661952393925579",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-drw6s%40serial-luncher-a6f7f.iam.gserviceaccount.com",
};

const formattedServiceAccount: ServiceAccount = {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  privateKey: serviceAccount.private_key,
};

// Initialize the app Firebase Admin SDK with the crdencials from the service account
export const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(formattedServiceAccount),
    projectId: serviceAccount.project_id,
    databaseURL: "https://serial-luncher-a6f7f.firebaseio.com",
  });
};
