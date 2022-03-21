import { IonButton, IonInput, IonPage } from '@ionic/react';
import { AuthService } from '../api';
import showInfo from '../components/Notification';
import './login.css';

export default function Login() {

    function handleSubmit(e: any) {
        e.preventDefault();
        if (!e.target.elements.username.value || !e.target.elements.password.value) {
            showInfo('Please fill in all fields', 'warning');
            return;
        }
        let formData = {
            username: e.target.elements.username.value,
            password: e.target.elements.password.value,
        }
        AuthService.authCookieLoginApiAuthLoginPost(formData).then(res => {
            showInfo('Login success', 'success');
            // go to /editor/mobile
            //window.location.href = '/editor/mobile'; with refresh 
            window.history.pushState({}, '', '/editor/add');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }).catch(err => {
            showInfo("We have problem with login", 'danger');
        });
    }

    return (
        <IonPage>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2 className='login-title'>
                    Login
                </h2>
                <IonInput name='username' placeholder='username' id='username' className='w-full height-normal' />
                <IonInput type='password' name='password' placeholder='password' id='password' className='w-full height-normal' />
                <IonButton type='submit' expand="block">Submit</IonButton>
                <br />
            </form>
        </IonPage>
    );
} 
