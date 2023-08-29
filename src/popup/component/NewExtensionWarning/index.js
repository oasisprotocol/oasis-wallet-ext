import warningIconSrc from '../../../assets/images/warning.svg';
import { getLanguage } from '../../../i18n';
import './index.scss';

export const NewExtensionWarning = () => {
  return (
    <div className="indicator">
      <div>
        <img src={warningIconSrc} alt={getLanguage('warning')} />
      </div>
      <div className="indicator-content">
        {getLanguage('newExtensionNotice')}
        <div>
          <button className="indicator-reminder">
            {getLanguage('remindMe')}
          </button>
        </div>
      </div>
    </div>
  );
};
