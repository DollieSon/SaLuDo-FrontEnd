# React+TypeScript Candidate Management Components

This folder contains a comprehensive set of React+TypeScript components for managing candidates in the SaLuDo talent management system.

## 📁 Folder Structure

```
components/
├── candidate/
│   ├── CandidateCard.tsx          # Individual candidate card display
│   ├── CandidateList.tsx          # List view with filtering and search
│   ├── CandidateForm.tsx          # Form for creating new candidates
│   ├── CandidateProfile.tsx       # Detailed candidate profile view
│   ├── CandidateSearch.tsx        # Search and filter component
│   ├── CandidateActions.tsx       # Bulk actions for selected candidates
│   ├── CandidateStats.tsx         # Statistics dashboard
│   ├── CandidateDashboard.tsx     # Complete dashboard combining all components
│   ├── skills/
│   │   ├── CandidateSkillCard.tsx    # Individual skill display with proficiency
│   │   ├── CandidateSkillForm.tsx    # Add/edit skills with autocomplete
│   │   └── CandidateSkillList.tsx    # Comprehensive skill management
│   ├── experience/
│   │   ├── ExperienceCard.tsx        # Individual experience display
│   │   ├── ExperienceForm.tsx        # Add/edit work experience
│   │   └── ExperienceTimeline.tsx    # Timeline view of career history
│   ├── education/
│   │   ├── EducationCard.tsx         # Individual education record display
│   │   ├── EducationForm.tsx         # Add/edit education records
│   │   └── EducationList.tsx         # Complete education management
│   ├── certifications/
│   │   ├── CertificationCard.tsx     # Individual certification display
│   │   ├── CertificationForm.tsx     # Add/edit certifications
│   │   └── CertificationList.tsx     # Complete certification management
│   ├── interviews/
│   │   ├── TranscriptViewer.tsx      # Interview transcript viewer
│   │   ├── TranscriptUpload.tsx      # Upload interview transcripts
│   │   ├── InterviewScheduler.tsx    # Schedule new interviews
│   │   └── InterviewHistory.tsx      # View past interviews
│   ├── resume/
│   │   └── ResumeUpload.tsx          # Drag-and-drop resume upload
│   └── types.ts                   # TypeScript interfaces for props
├── workflow/
│   ├── CandidateBulkActions.tsx   # Bulk operations for multiple candidates
│   ├── AdvancedFilters.tsx        # Advanced filtering and search capabilities
│   ├── PipelineAutomation.tsx     # Automated workflow rules and triggers
│   ├── ApprovalFlows.tsx          # Multi-step approval processes
│   └── NotificationSystem.tsx     # Real-time notifications and alerts
├── analytics/
│   ├── PipelineAnalytics.tsx      # Recruitment pipeline visualization
│   ├── SkillAnalytics.tsx         # Skills analysis and trends
│   └── AdvancedAnalytics.tsx      # Comprehensive analytics dashboard
├── forms/
│   ├── ScoreInput.tsx             # Interactive 1-10 score selector
│   └── AutoComplete.tsx           # Autocomplete input with suggestions
├── common/
│   ├── LoadingSpinner.tsx         # Reusable loading component
│   ├── ErrorMessage.tsx           # Reusable error display component
│   ├── ConfirmDialog.tsx          # Confirmation modal dialog
│   ├── Modal.tsx                  # Generic modal wrapper
│   └── types.ts                   # TypeScript interfaces for common components
└── index.ts                       # Barrel exports for easy importing
```

## 🧩 Components Overview

### Phase 1 Implementation ✅

#### **Essential UI Components**

**`ConfirmDialog`** - Modal confirmation dialog with customizable styling
- Supports danger, warning, and info types
- Loading states and custom button text
- Keyboard navigation support

**`Modal`** - Generic modal wrapper with flexible sizing
- Multiple size options (sm, md, lg, xl, full)
- Backdrop click to close
- Keyboard escape support

#### **Advanced Skill Management Suite**

**`CandidateSkillCard`** - Rich skill display with proficiency visualization
- Visual proficiency bars and color coding
- AI vs Human added badges
- Evidence display with formatting
- Compact mode for overview displays

**`CandidateSkillForm`** - Comprehensive skill creation/editing
- Autocomplete with existing skills database
- Interactive score slider (1-10) with visual feedback
- Evidence text area with validation
- Support for AI vs Manual classification

**`CandidateSkillList`** - Complete skill management dashboard
- Statistics overview (total, AI added, manual, avg score)
- Advanced filtering (AI/Human source, proficiency level)
- Sorting options (score, name, date added)
- Bulk operations support
- Empty states and loading indicators

#### **Enhanced Form Controls**

**`ScoreInput`** - Interactive proficiency score selector
- Visual slider with color-coded feedback
- Click buttons for precise control
- Expert/Proficient/Intermediate/Beginner labels
- Real-time visual updates

**`AutoComplete`** - Smart autocomplete input
- Keyboard navigation (arrow keys, enter, escape)
- Scroll-to-view for long lists
- Custom value support
- Loading states and validation

#### **Resume Management**

**`ResumeUpload`** - Professional drag-and-drop upload
- Multiple file format support (PDF, DOC, DOCX)
- File size validation and visual feedback
- Drag and drop with visual states
- Current file display and error handling

### Candidate Components

#### `CandidateCard`
Displays a single candidate in a card format with status, basic info, and action buttons.

**Props:**
- `candidate`: CandidateData object
- `onClick?`: Function called when card is clicked
- `onStatusChange?`: Function to handle status updates
- `showActions?`: Whether to show action buttons (default: true)

#### `CandidateList`
Renders a list of candidate cards with built-in filtering and search capabilities.

**Props:**
- `onCandidateSelect?`: Function called when a candidate is selected
- `filters?`: Object with status, search, and role filters
- `showActions?`: Whether to show action buttons (default: true)

#### `CandidateForm`
Form component for creating new candidates with resume upload and validation.

**Props:**
- `onSuccess?`: Function called when candidate is successfully created
- `onCancel?`: Function called when form is cancelled
- `initialData?`: Pre-populated form data

#### `CandidateProfile`
Detailed view of a candidate with tabs for different sections (overview, skills, experience, etc.).

**Props:**
- `candidateId`: ID of the candidate to display
- `onEdit?`: Function called when edit button is clicked
- `onBack?`: Function called when back button is clicked

#### `CandidateSearch`
Advanced search and filtering component with status, role, and text search.

**Props:**
- `onSearch`: Function called when search term changes
- `onStatusFilter`: Function called when status filter changes
- `onRoleFilter`: Function called when role filter changes
- `placeholder?`: Search input placeholder text
- `availableRoles?`: Array of available role options

#### `CandidateActions`
Bulk actions component for operating on multiple selected candidates.

**Props:**
- `selectedCandidates`: Array of selected candidates
- `onActionComplete`: Function called when bulk action is completed
- `onSelectionClear`: Function called to clear selection

#### `CandidateStats`
Dashboard statistics showing candidate counts by status and other metrics.

**Props:**
- `candidates`: Array of all candidates for calculating stats
- `loading?`: Whether data is still loading (default: false)

#### `CandidateDashboard`
Complete dashboard that combines all candidate management functionality in one component.

**Props:**
- `initialView?`: Initial view to display ('list' | 'form' | 'profile')
- `candidateId?`: Initial candidate ID for profile view

### Common Components

#### `LoadingSpinner`
Reusable loading spinner with customizable size and message.

**Props:**
- `size?`: Spinner size ('sm' | 'md' | 'lg', default: 'md')
- `message?`: Loading message (default: 'Loading...')

#### `ErrorMessage`
Reusable error message component with optional retry functionality.

**Props:**
- `message`: Error message to display
- `onRetry?`: Function called when retry button is clicked
- `type?`: Message type ('error' | 'warning' | 'info', default: 'error')

## 🚀 Usage Examples

### Basic Candidate List
```tsx
import { CandidateList } from './components';

function MyApp() {
  return (
    <CandidateList
      onCandidateSelect={(candidate) => console.log('Selected:', candidate)}
      showActions={true}
    />
  );
}
```

### Complete Dashboard
```tsx
import { CandidateDashboard } from './components';

function App() {
  return (
    <CandidateDashboard 
      initialView="list"
    />
  );
}
```

### Custom Form with Callbacks
```tsx
import { CandidateForm } from './components';

function AddCandidate() {
  const handleSuccess = (candidateId: string) => {
    console.log('New candidate created:', candidateId);
    // Navigate to profile or show success message
  };

  return (
    <CandidateForm
      onSuccess={handleSuccess}
      onCancel={() => history.back()}
    />
  );
}
```

### Search with Custom Filters
```tsx
import { CandidateSearch, CandidateList } from './components';
import { useState } from 'react';

function FilterableCandidateView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  return (
    <div>
      <CandidateSearch
        onSearch={setSearchTerm}
        onStatusFilter={setStatusFilter}
        onRoleFilter={() => {}}
        availableRoles={['Developer', 'Designer', 'Manager']}
      />
      <CandidateList
        filters={{ search: searchTerm, status: statusFilter }}
      />
    </div>
  );
}
```

## 🎨 Styling

All components use **Tailwind CSS** classes for styling. The design follows these principles:

- **Consistent color scheme**: Blue for primary actions, gray for neutral elements
- **Responsive design**: Components adapt to different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Modern UI**: Clean, minimalist design with subtle shadows and hover effects

### Color Scheme
- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a)
- **Warning**: Yellow-600 (#ca8a04)
- **Error**: Red-600 (#dc2626)
- **Neutral**: Gray-600 (#4b5563)

## 🔧 Integration Notes

### Prerequisites
These components require:
- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+
- The API types and clients from the parent ForFrontEnd folder

### API Integration
Components use the API clients from `../clients/CandidateApiClient.ts` and types from `../types/CandidateApiTypes.ts`.

### Error Handling
All components include proper error handling and loading states. Network errors are caught and displayed using the `ErrorMessage` component.

### Performance Considerations
- Components use React hooks efficiently
- Large lists are filtered client-side (consider server-side pagination for production)
- API calls are debounced where appropriate
- Loading states prevent multiple simultaneous requests

## 🔮 Future Enhancements

Potential improvements to consider:
- Virtual scrolling for large candidate lists
- Advanced filtering with date ranges and skill matching
- Drag-and-drop for status changes
- Export functionality (CSV, PDF)
- Real-time updates with WebSockets
- Advanced search with full-text indexing
- Mobile-optimized layouts

## 📝 Notes

**Important**: These components are designed to run in a React environment. The TypeScript errors you see in VS Code are expected since we're in a backend-focused workspace without React dependencies installed. When used in an actual React project, all imports and JSX will work correctly.

To use these components in a React project:

1. Copy the entire `components` folder to your React project
2. Install dependencies: `npm install react react-dom @types/react @types/react-dom`
3. Ensure Tailwind CSS is configured
4. Import and use the components as shown in the examples above

### Phase 2 Implementation ✅

#### **Education Management Suite**

**`EducationCard`** - Professional education record display
- Institution, degree, and field of study
- Date ranges with current enrollment support
- GPA and honors display
- Formatted descriptions

**`EducationForm`** - Comprehensive education entry form
- Institution and degree validation
- Date range validation with current enrollment option
- GPA validation (0-4.0 scale)
- Honors and awards section
- Rich description text area

**`EducationList`** - Complete education management interface
- Chronological sorting (most recent first)
- Add, edit, and delete operations
- Modal form integration
- Empty states and loading indicators
- Confirmation dialogs for deletions

#### **Certification Management Suite**

**`CertificationCard`** - Professional certification display
- Issuing organization and credential details
- Issue and expiration date tracking
- Status badges (Active, Expiring Soon, Expired)
- Credential ID and verification URL links
- Expiration warnings and color coding

**`CertificationForm`** - Comprehensive certification entry
- Name and issuing organization validation
- Date validation with "never expires" option
- Credential ID and URL fields
- URL validation for verification links
- Rich description support

**`CertificationList`** - Advanced certification management
- Status-based sorting (active first, expired last)
- Expiration tracking and statistics
- Category grouping support
- Bulk operations and filtering
- Expiration alerts and notifications

#### **Interview Management Suite**

**`InterviewScheduler`** - Professional interview scheduling
- Multiple interview types (Phone, Video, In-Person, Technical, Behavioral)
- Date and time validation (future only)
- Duration selection with preset options
- Location/meeting URL based on type
- Multiple interviewer support
- Rich notes and agenda support

**`InterviewHistory`** - Comprehensive interview tracking
- Upcoming vs. past interview separation
- Status tracking (Scheduled, Completed, Cancelled, No-Show)
- Interview type icons and visual organization
- Rating and feedback display
- Meeting links and location information
- Timeline-based organization

#### **Analytics & Reporting Suite**

**`PipelineAnalytics`** - Recruitment pipeline visualization
- Stage-by-stage candidate flow
- Conversion rate calculations between stages
- Visual progress bars with color coding
- Summary statistics and overall conversion
- Detailed breakdown with expandable views
- Customizable stage colors and names

**`SkillAnalytics`** - Skills analysis and trends
- Most common skills ranking
- Frequency and proficiency analysis
- Category-based skill grouping
- High-demand skills identification (>50% threshold)
- Average scoring across skill sets
- Interactive skill frequency bars

#### **Enhanced Experience Management**

**`ExperienceForm`** - Comprehensive work experience entry
- Company and position validation
- Date range validation with current role option
- Salary range with privacy controls
- Rich responsibility descriptions
- Achievement highlighting

**`ExperienceTimeline`** - Career progression visualization
- Chronological career timeline
- Role progression indicators
- Experience gap identification
- Company tenure visualization
- Interactive timeline navigation

#### **Advanced Workflow Components**

**`StatusChangeDialog`** - Professional status transition interface
- Visual status selection with color coding
- Conditional reason requirements for sensitive changes
- Validation and error handling
- Loading states and confirmation
- Audit trail support

**`ActivityFeed`** - Real-time activity tracking
- Chronological activity timeline
- Multiple activity types with custom icons
- User attribution and timestamps
- Relative time formatting ("2h ago", "3d ago")
- Expandable view for detailed history
- Loading states and empty state handling

### Component Integration Examples

#### Complete Candidate Profile
```jsx
import {
  CandidateProfile,
  EducationList,
  CertificationList,
  ExperienceTimeline,
  InterviewHistory,
  CandidateSkillList
} from '@/components';

function CandidateDetailsPage({ candidateId }) {
  return (
    <div className="space-y-6">
      <CandidateProfile candidateId={candidateId} />
      <CandidateSkillList candidateId={candidateId} />
      <ExperienceTimeline candidateId={candidateId} />
      <EducationList candidateId={candidateId} />
      <CertificationList candidateId={candidateId} />
      <InterviewHistory candidateId={candidateId} />
    </div>
  );
}
```

#### Analytics Dashboard
```jsx
import {
  PipelineAnalytics,
  SkillAnalytics,
  CandidateStats
} from '@/components';

function AnalyticsDashboard({ candidates, pipelineData, skillsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PipelineAnalytics stages={pipelineData} totalCandidates={candidates.length} />
      <SkillAnalytics skills={skillsData} totalCandidates={candidates.length} />
      <div className="lg:col-span-2">
        <CandidateStats candidates={candidates} />
      </div>
    </div>
  );
}
```

#### Interview Management
```jsx
import {
  InterviewScheduler,
  InterviewHistory,
  Modal
} from '@/components';

function InterviewManagement({ candidateId }) {
  const [showScheduler, setShowScheduler] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowScheduler(true)}>
        Schedule Interview
      </button>
      
      <InterviewHistory 
        candidateId={candidateId}
        onView={handleViewInterview}
        onEdit={handleEditInterview}
        onCancel={handleCancelInterview}
      />
      
      <Modal isOpen={showScheduler} onClose={() => setShowScheduler(false)}>
        <InterviewScheduler
          candidateId={candidateId}
          onSchedule={handleScheduleInterview}
          onCancel={() => setShowScheduler(false)}
        />
      </Modal>
    </div>
  );
}
```

### Additional Features in Phase 2

#### **Smart Validation & UX**
- Form validation with real-time feedback
- Date range validation across all components
- URL validation for external links
- File type and size validation
- Accessibility compliance (ARIA labels, keyboard navigation)

#### **Data Consistency**
- Consistent date formatting across components
- Standardized color schemes and status indicators
- Unified loading and error states
- Consistent modal and dialog patterns

#### **Performance Optimizations**
- Conditional rendering for large datasets
- Lazy loading for complex components
- Optimized re-renders with proper dependency arrays
- Memoization for expensive calculations

#### **Responsive Design**
- Mobile-first responsive layouts
- Touch-friendly interfaces
- Collapsible sections for mobile views
- Adaptive grid systems

## 🚀 Phase 3: Advanced Workflow & Analytics (Latest)

### Advanced Workflow Components

#### **`PipelineAutomation`** - Intelligent workflow automation
- **Purpose**: Create and manage automated rules for candidate pipeline progression
- **Key Features**:
  - Visual rule builder with triggers, conditions, and actions
  - Multiple trigger types (status change, time elapsed, score thresholds)
  - Action automation (status updates, emails, notifications, assignments)
  - Real-time automation statistics and success rates
  - Rule activation/deactivation controls
- **Integration**: Works with candidate status changes and notification system

```tsx
import { PipelineAutomation } from './components/workflow';

function AutomationPanel() {
  const handleRuleCreate = async (rule) => {
    // Create automation rule via API
    const response = await api.createAutomationRule(rule);
    return response;
  };

  return (
    <PipelineAutomation
      onRuleCreate={handleRuleCreate}
      onRuleUpdate={handleRuleUpdate}
      onRuleDelete={handleRuleDelete}
      onRuleToggle={handleRuleToggle}
    />
  );
}
```

#### **`ApprovalFlows`** - Multi-step approval processes
- **Purpose**: Manage complex approval workflows for hiring decisions
- **Key Features**:
  - Multi-step approval chains with role-based approvers
  - Approval request creation with justification and metadata
  - Real-time approval status tracking and notifications
  - Comment system for approval discussions
  - Escalation rules and auto-approval capabilities
  - Priority-based request handling
- **Integration**: Integrates with notification system and candidate status management

```tsx
import { ApprovalFlows } from './components/workflow';

function ApprovalManagement() {
  return (
    <ApprovalFlows
      onRequestApproval={handleRequestApproval}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
      onAddComment={handleAddComment}
      currentUserId="user123"
      currentUserRole="manager"
    />
  );
}
```

#### **`NotificationSystem`** - Comprehensive notification management
- **Purpose**: Real-time alerts and notification delivery across multiple channels
- **Key Features**:
  - Multi-channel delivery (email, push, browser notifications)
  - Category-based notification filtering and settings
  - Action buttons within notifications for quick responses
  - Notification history and read status tracking
  - Quiet hours and frequency controls
  - Toast notifications for urgent alerts
- **Integration**: Central notification hub for all system events

```tsx
import { NotificationSystem } from './components/workflow';

function NotificationCenter() {
  return (
    <NotificationSystem
      onNotificationAction={handleNotificationAction}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDeleteNotification}
      onUpdateSettings={handleUpdateSettings}
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}
```

#### **`AdvancedAnalytics`** - Deep recruitment insights
- **Purpose**: Comprehensive analytics dashboard with advanced metrics
- **Key Features**:
  - **Diversity & Inclusion**: Gender, ethnicity, age, and geographic diversity metrics
  - **Hiring Metrics**: Time-to-hire, cost-per-hire, source effectiveness analysis
  - **Funnel Analysis**: Conversion rates, bottleneck identification, drop-off analysis
  - **Quality of Hire**: Performance ratings, retention rates, manager satisfaction
  - **ROI Analysis**: Recruitment return on investment and payback calculations
  - Data export capabilities (CSV, Excel, PDF)
  - Interactive charts and trend analysis
- **Integration**: Aggregates data from all candidate interactions and outcomes

```tsx
import { AdvancedAnalytics } from './components/analytics';

function AnalyticsDashboard() {
  const dateRange = {
    start: new Date('2024-01-01'),
    end: new Date()
  };

  return (
    <AdvancedAnalytics
      dateRange={dateRange}
      jobIds={selectedJobIds}
      departmentIds={selectedDepartmentIds}
      onExportData={handleExportData}
    />
  );
}
```

### Enhanced Integration Examples

#### Complete Workflow Integration
```tsx
import {
  CandidateList,
  CandidateBulkActions,
  AdvancedFilters,
  NotificationSystem,
  ApprovalFlows
} from './components';

function CandidateWorkflow() {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [filters, setFilters] = useState({});
  const [showApprovals, setShowApprovals] = useState(false);

  return (
    <div className="candidate-workflow">
      <div className="workflow-header">
        <AdvancedFilters
          onFiltersChange={setFilters}
          onSaveFilter={handleSaveFilter}
          savedFilters={savedFilters}
        />
        
        <NotificationSystem
          onNotificationAction={handleNotificationAction}
          currentUserId={currentUser.id}
        />
      </div>

      <div className="workflow-main">
        <CandidateList
          filters={filters}
          onCandidateSelect={handleCandidateSelect}
          selectedCandidates={selectedCandidates}
          onSelectionChange={setSelectedCandidates}
        />
        
        {selectedCandidates.length > 0 && (
          <CandidateBulkActions
            selectedCandidates={selectedCandidates}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedCandidates([])}
            onRequestApproval={() => setShowApprovals(true)}
          />
        )}
      </div>

      {showApprovals && (
        <ApprovalFlows
          onRequestApproval={handleRequestApproval}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
        />
      )}
    </div>
  );
}
```

#### Analytics Integration
```tsx
import {
  AdvancedAnalytics,
  PipelineAnalytics,
  SkillAnalytics,
  CandidateStats
} from './components';

function AnalyticsSuite() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="analytics-suite">
      <div className="analytics-nav">
        <button 
          onClick={() => setActiveView('overview')}
          className={activeView === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveView('pipeline')}
          className={activeView === 'pipeline' ? 'active' : ''}
        >
          Pipeline
        </button>
        <button 
          onClick={() => setActiveView('skills')}
          className={activeView === 'skills' ? 'active' : ''}
        >
          Skills
        </button>
        <button 
          onClick={() => setActiveView('advanced')}
          className={activeView === 'advanced' ? 'active' : ''}
        >
          Advanced
        </button>
      </div>

      <div className="analytics-content">
        {activeView === 'overview' && <CandidateStats />}
        {activeView === 'pipeline' && <PipelineAnalytics />}
        {activeView === 'skills' && <SkillAnalytics />}
        {activeView === 'advanced' && (
          <AdvancedAnalytics
            onExportData={handleExportData}
          />
        )}
      </div>
    </div>
  );
}
```

### Phase 3 Advanced Features

#### **Automation & Intelligence**
- Smart workflow automation with ML-powered triggers
- Predictive analytics for candidate success
- Auto-assignment based on skills matching
- Intelligent notification prioritization

#### **Advanced Analytics**
- Real-time dashboard updates
- Custom metric calculations
- Comparative analysis tools
- Trend prediction and forecasting

#### **Enterprise Features**
- Multi-tenant support
- Advanced role-based permissions
- Audit logging and compliance
- API rate limiting and monitoring

#### **Performance & Scalability**
- Virtual scrolling for large datasets
- Background data processing
- Optimistic UI updates
- Progressive data loading

## 🎯 Complete Integration Guide

The component library is designed for seamless integration with any React application. All components are:

- **Fully Typed**: Complete TypeScript interfaces and props
- **Modular**: Import only what you need
- **Customizable**: Easy theming and styling overrides
- **Accessible**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design approach
- **Production Ready**: Optimized for performance and reliability

For detailed API documentation and integration examples, see the `/documentation/` folder.
