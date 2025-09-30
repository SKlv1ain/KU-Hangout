import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../styles/components.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("participated");
  const navigate = useNavigate();

  return (
    <div className="profile-page">
      <Navbar />
      
      {/* Header with back button */}
      <div className="profile-header">
        <div className="profile-header-container">
          <button 
            onClick={() => navigate("/")}
            className="profile-back-btn"
          >
            <span className="material-icons-outlined">arrow_back</span>
            <span>กลับ</span>
          </button>
          <div className="profile-actions">
            <button className="profile-action-btn">
              <span className="material-icons-outlined">share</span>
            </button>
            <button className="profile-action-btn">
              <span className="material-icons-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="profile-main">
        {/* Profile Picture and Info */}
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
              alt="Profile"
            />
          </div>
          <div className="profile-details">
            <h1>M</h1>
            <p>@lv1in</p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-number">0</div>
            <div className="profile-stat-label">ผู้ติดตาม</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">0</div>
            <div className="profile-stat-label">กำลังติดตาม</div>
          </div>
        </div>

        {/* Bio */}
        <div className="profile-bio">
          <p>M ยังไม่ได้เขียนอะไรเลย</p>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions-row">
          <button className="profile-edit-btn">
            แก้ไขโปรไฟล์
          </button>
          <button className="profile-follow-btn">
            ติดตาม
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <div className="profile-tabs-container">
            <button
              onClick={() => setActiveTab("participated")}
              className={`profile-tab ${activeTab === "participated" ? "active" : "inactive"}`}
            >
              เคยเข้าร่วม
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`profile-tab ${activeTab === "posts" ? "active" : "inactive"}`}
            >
              โพสต์
            </button>
            <button
              onClick={() => setActiveTab("stickers")}
              className={`profile-tab ${activeTab === "stickers" ? "active" : "inactive"}`}
            >
              สติกเกอร์
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          <div className="profile-empty">
            <span className="profile-empty-icon">event</span>
            <p>ไม่พบผลลัพธ์</p>
          </div>
        </div>
      </div>
    </div>
  );
}


