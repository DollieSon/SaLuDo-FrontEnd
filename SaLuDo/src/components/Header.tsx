import './css/Header.css';
import React from 'react'

const header: React.FC = () =>  {
    return (
      <div className="topbar">
        <div className="topbar-right">
          <div>
            <img src="/images/notifs.png" alt="Notif" />
            <span className="notification-dot"></span>
          </div>
          <img src="/images/chat.png" alt="Messages" />
          <div className="user-profile">
            <img src="/images/wony.jpg" alt="Profile Picture" />
            <span>Vicky Jang</span>
            <img src="/images/down.png" alt="Down" className="down" />
          </div>
        </div>
      </div>
    );
  }

  export default header