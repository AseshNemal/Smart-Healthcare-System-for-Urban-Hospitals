# Statistical Reports - Healthcare Manager Feature

## Overview
The Statistical Reports feature allows Healthcare Managers to generate comprehensive reports on patient visits, service utilization, and operational metrics to support data-driven decision making.

## Use Case 03: Generate Statistical Reports

### Description
Healthcare Managers can generate statistical reports to analyze patient visits, service utilization, peak hours, and staff scheduling for improved service delivery and patient flow.

### Access
- **URL**: `/admin/reports`
- **Role Required**: Healthcare Manager / Admin
- **Login**: `admin@healthcare.com` (or any admin account)

---

## Features

### 1. **Report Filters**
Healthcare Managers can customize reports using:
- **Report Type**: Patient Visits, Service Utilization, Doctor Performance, Financial Summary
- **Date Range**: Select start and end dates for the reporting period
- **Department**: Filter by specific department or view all departments
- **Doctor**: Filter by specific doctor or view all doctors

### 2. **Three Report Views**

#### **📊 Charts Tab**
Visual representations of data:

**Patient Visits Over Time**
- Line chart showing daily visit trends
- Helps identify patterns and seasonal variations
- X-axis: Dates, Y-axis: Number of visits

**Service Utilization**
- Donut chart showing service distribution
- Displays percentage breakdown by service type
- Color-coded for easy identification
- Legend shows: Consultation, Therapy, Surgery, Rehab, Other

#### **📋 Tables Tab**
Detailed patient information in tabular format:

| Column | Description |
|--------|-------------|
| Patient Name | Name of the patient |
| Visit Date | Date of appointment (YYYY-MM-DD) |
| Doctor | Assigned doctor name |
| Department | Medical specialty |
| Service Type | Type of service provided |

**Features:**
- Displays up to 100 most recent records
- Sortable columns
- Hover effects for better readability

#### **📈 Summary Tab**
Key performance indicators (KPIs):

**Average Daily Visits**
- Total visits divided by days in selected period
- Large numeric display
- Example: 250 visits/day

**Peak Hours**
- Busiest time period for appointments
- Format: "10 AM - 1 PM"
- Calculated from appointment time slots

**Utilization Rate**
- Percentage of capacity used
- Formula: (Total Visits / (Days × Daily Capacity)) × 100
- Assumes 10 appointment slots per day capacity

---

## Main Flow

1. **Healthcare Manager logs into the system**
   - Navigate to `/login`
   - Enter admin credentials
   - System authenticates and redirects to admin portal

2. **Access Reports**
   - Click "📊 Generate Reports" in the navigation bar
   - System loads the Reports page

3. **Select Report Parameters**
   - Choose Report Type (default: "Patient Visits")
   - Optional: Set date range
   - Optional: Filter by department
   - Optional: Filter by doctor

4. **Generate Report**
   - Click "Generate Report" button
   - System queries the database
   - Processes and aggregates data
   - Displays results in Charts, Tables, and Summary tabs

5. **Review Report**
   - Switch between tabs to view different perspectives
   - Charts: Visual trends
   - Tables: Detailed records
   - Summary: Key statistics

---

## Alternate Flows

### A1: Report Customization
1. Manager applies different filters
2. Clicks "Generate Report"
3. System regenerates with updated criteria
4. New data displayed across all tabs

### A2: Reset Filters
1. Manager clicks "Reset Filters" button
2. All filters return to default values
3. Report regenerates with full dataset

### A3: No Data Found
If selected criteria return no records:
- System displays: "No data available for the selected parameters."
- Charts show: "No data available"
- Tables show: "No patient details available"
- Summary shows: All metrics as 0 or "N/A"

---

## Exception Flows

### E1: Database Connection Failure
- **Trigger**: Database is unreachable
- **Response**: Yellow warning banner displays
- **Message**: "Unable to retrieve data. Please try again later."
- **Action**: Manager can retry after system recovers

### E2: Unauthorized Access
- **Trigger**: User without admin/manager role tries to access
- **Response**: System blocks access
- **Action**: Redirects to login or shows 403 error
- **Logging**: Access attempt is logged

### E3: System Timeout
- **Trigger**: Report generation takes too long (>30 seconds)
- **Response**: Request times out
- **Message**: Error displayed to user
- **Action**: Manager can try with smaller date range

---

## Technical Implementation

### API Endpoint
**GET** `/api/reports`

**Query Parameters:**
```
reportType: string (default: "Patient Visits")
startDate: string (ISO 8601 date)
endDate: string (ISO 8601 date)
department: string (default: "All Departments")
doctorId: string (default: "All Doctors")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalVisits": 1250,
      "averageDailyVisits": 250,
      "peakHours": "10 AM - 1 PM",
      "utilizationRate": 80
    },
    "chartData": {
      "visitsOverTime": [
        { "date": "Jul 2", "visits": 15 },
        { "date": "Jul 3", "visits": 22 }
      ],
      "serviceUtilization": [
        { "name": "Consultation", "value": 476, "percentage": 38 },
        { "name": "Therapy", "value": 240, "percentage": 19 }
      ]
    },
    "appointments": [
      {
        "patientName": "Sophia Clark",
        "visitDate": "2024-07-02",
        "doctor": "Dr. Ethan Carter",
        "department": "Cardiology",
        "serviceType": "Consultation"
      }
    ]
  }
}
```

### Components Used
- **Recharts**: Data visualization library
  - `LineChart`: Patient visits over time
  - `PieChart`: Service utilization (donut chart)
- **React State**: Filter management
- **Next.js API Routes**: Data fetching

---

## Usage Examples

### Example 1: Monthly Performance Review
**Scenario**: Manager wants to review July performance

**Steps:**
1. Set Date Range: `2024-07-01` to `2024-07-31`
2. Keep Department: "All Departments"
3. Keep Doctor: "All Doctors"
4. Click "Generate Report"

**Results:**
- Charts show daily trends for July
- Summary shows: 250 avg visits, 10 AM-1 PM peak, 80% utilization
- Tables list all July appointments

### Example 2: Cardiology Department Analysis
**Scenario**: Analyze cardiology workload

**Steps:**
1. Set Department: "Cardiology"
2. Leave date range empty (all time)
3. Click "Generate Report"

**Results:**
- Only cardiology appointments shown
- Service breakdown specific to cardiology
- Identify cardiology-specific patterns

### Example 3: Individual Doctor Performance
**Scenario**: Review Dr. Ethan Carter's patients

**Steps:**
1. Set Doctor: "Dr. Ethan Carter"
2. Set Date Range: Last 30 days
3. Click "Generate Report"

**Results:**
- Only Dr. Carter's appointments
- His service distribution
- His peak working hours

---

## Benefits

### For Healthcare Managers
- ✅ **Data-Driven Decisions**: Make informed staffing and resource allocation decisions
- ✅ **Trend Identification**: Spot patterns in patient visits and service demand
- ✅ **Capacity Planning**: Understand utilization rates to optimize scheduling
- ✅ **Performance Tracking**: Monitor department and doctor productivity

### For Hospital Operations
- ✅ **Resource Optimization**: Allocate staff based on peak hours
- ✅ **Service Planning**: Adjust service offerings based on demand
- ✅ **Financial Insights**: Understand revenue patterns (future enhancement)
- ✅ **Quality Improvement**: Identify areas needing attention

---

## Postconditions

After successful report generation:
- ✅ Statistical report is displayed to Healthcare Manager
- ✅ Data is available across three tabs (Charts, Tables, Summary)
- ✅ Information ready for decision-making on:
  - Staff scheduling
  - Resource allocation
  - Service expansion
  - Department optimization

---

## Future Enhancements

### Planned Features
1. **Export Reports**: PDF and Excel export functionality
2. **Email Reports**: Schedule automated email delivery
3. **Financial Metrics**: Revenue and billing analytics
4. **Predictive Analytics**: ML-based demand forecasting
5. **Custom Dashboards**: Save favorite report configurations
6. **Real-time Updates**: Live data refresh
7. **Comparative Analysis**: Year-over-year comparisons

---

## Testing Checklist

### Functional Testing
- [ ] Report generates with default parameters
- [ ] Date range filtering works correctly
- [ ] Department filtering works correctly
- [ ] Doctor filtering works correctly
- [ ] Reset filters returns to defaults
- [ ] All three tabs display data correctly
- [ ] Charts render properly
- [ ] Tables display patient details
- [ ] Summary shows accurate statistics

### Error Handling
- [ ] No data message displays when no records found
- [ ] Database error shows appropriate message
- [ ] Loading state displays during generation
- [ ] Timeout handling works
- [ ] Unauthorized access is blocked

### UI/UX Testing
- [ ] Charts are responsive on mobile
- [ ] Tables scroll horizontally on small screens
- [ ] All filters are accessible
- [ ] Color schemes work in dark mode
- [ ] Navigation is intuitive

---

## Support

For technical issues or questions:
- Check the API logs in `/api/reports/route.ts`
- Verify database connection
- Ensure user has admin role
- Review browser console for errors

---

## Compliance & Security

- ✅ **HIPAA Compliance**: Patient data is protected
- ✅ **Role-Based Access**: Only admins can access reports
- ✅ **Data Privacy**: No sensitive medical info exposed
- ✅ **Audit Trail**: Access logs maintained
- ✅ **Secure API**: Authentication required

---

*Last Updated: October 16, 2025*
*Version: 1.0.0*
