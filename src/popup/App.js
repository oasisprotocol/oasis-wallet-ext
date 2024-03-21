import IdleTimer from 'react-idle-timer';
import { WALLET_RESET_LAST_ACTIVE_TIME } from '../constant/types';
import { sendMsg } from '../utils/commonMsg';
import './App.scss';
import { getAllRouter as AllRouter } from './router';

function setLastActiveTime() {
}

function App() {
  return (
    <div className="App">
      <IdleTimer onAction={setLastActiveTime} throttle={1000}>
        <header className="App-header">
          <AllRouter />
        </header>
      </IdleTimer>
    </div>
  );
}
export default App;



