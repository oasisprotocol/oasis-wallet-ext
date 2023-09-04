import differenceInDays from 'date-fns/differenceInDays';
import { NEW_EXTENSION_RELEASE_DATE } from '../../../../config';
import warningIconSrc from '../../../assets/images/warning.svg';
import { getLanguage } from '../../../i18n';
import { DISMISSED_NEW_EXTENSION_WARNING } from '../../../constant/storageKey';
import { saveLocal } from '../../../background/storage/localStorage';
import './index.scss';

const canDismiss = NEW_EXTENSION_RELEASE_DATE
  ? differenceInDays(new Date(NEW_EXTENSION_RELEASE_DATE), new Date()) > 3
  : true;

export const NewExtensionWarning = (props) => {
  const handleClick = () => {
    saveLocal(DISMISSED_NEW_EXTENSION_WARNING, new Date().toISOString());
    props.handleClick();
  };

  return (
    <div className="indicator">
      <div>
        <img src={warningIconSrc} alt={getLanguage('warning')} />
      </div>
      <div className="indicator-content">
        {getLanguage('newExtensionNotice')}
        {canDismiss && (
          <div>
            <button className="indicator-reminder" onClick={handleClick}>
              {getLanguage('remindMe')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
