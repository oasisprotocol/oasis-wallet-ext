import warningIconSrc from '../../../assets/images/warning.svg';
import { getLanguage } from '../../../i18n';
import { NEW_EXTENSION_WARNING_DISMISSED } from "../../../constant/storageKey";
import { saveLocal } from "../../../background/storage/localStorage";
import './index.scss';

export const NewExtensionWarning = (props) => {
  const handleClick = () => {
    saveLocal(NEW_EXTENSION_WARNING_DISMISSED, true)
    props.handleClick()
  }

  return (
    <div className="indicator">
      <div>
        <img src={warningIconSrc} alt={getLanguage('warning')} />
      </div>
      <div className="indicator-content">
        {getLanguage('newExtensionNotice')}
        <div>
          <button className="indicator-reminder" onClick={handleClick}>
            {getLanguage('remindMe')}
          </button>
        </div>
      </div>
    </div>
  );
};
