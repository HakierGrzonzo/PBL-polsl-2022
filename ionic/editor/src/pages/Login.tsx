import { IonButton, IonInput, IonPage, useIonToast } from '@ionic/react';
import { AuthService, OpenAPI } from '../api';
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
        let resault = await AuthService.authJwtLoginApiJwtLoginPost(formData);
        if (resault.access_token) {
            OpenAPI.TOKEN = resault.access_token;
            showInfo('Login success', 'success');
            window.history.pushState({}, '', '/editor/add');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }

    return (
        <IonPage>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2 className='login-title'>
                    Login
                </h2>
                <IonInput name='username' placeholder='username' id='username' className='w-full height-normal' />
                <IonInput type='password' name='password' placeholder='password' id='password' className='w-full height-normal' />
                <IonButton type='submit' expand="block" >Submit</IonButton>
                <br />
            </form>
        </IonPage>
    );
} 
