import * as firebase from 'firebase-admin'
import { join } from 'path'

export const firebaseCofing = {
  credential: firebase.credential.cert(join(__dirname, '..', '..', 'firebase.json')),
}
