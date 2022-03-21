import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { addCircleOutline, colorWandOutline, lockClosedOutline } from 'ionicons/icons';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';


setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/editor/login">
            {/*<Login />*/}
          </Route>
          <Route exact path="/editor/add">
            {/*<AddMeasurement />*/}
          </Route>
          <Route exact path="/editor/edit/:id">
            {/*<EditMeasurement />*/}
          </Route>
          <Route exact path="/">
            <Redirect to="/editor/login" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="login" href="/editor/login">
            <IonIcon icon={lockClosedOutline} />
            <IonLabel>login</IonLabel>
          </IonTabButton>
          <IonTabButton tab="add" href="/editor/add">
            <IonIcon icon={addCircleOutline} />
            <IonLabel>add</IonLabel>
          </IonTabButton>
          <IonTabButton tab="edit" href="/editor/edit/5">
            <IonIcon icon={colorWandOutline} />
            <IonLabel>edit</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
