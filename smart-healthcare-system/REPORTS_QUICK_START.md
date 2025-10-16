# Quick Start: Statistical Reports Feature

## 🚀 Access the Reports Page

### Step 1: Login as Healthcare Manager
```
URL: http://localhost:3000/login
Email: admin@healthcare.com
Password: [Your admin password]
```

### Step 2: Navigate to Reports
After login, click **"📊 Generate Reports"** in the navigation bar

**Or directly visit:**
```
http://localhost:3000/admin/reports
```

---

## 📊 Generate Your First Report

### Default Report (Immediate)
The page **automatically generates** a report on load with:
- ✅ All patient visits
- ✅ All departments
- ✅ All doctors
- ✅ All time periods

### Custom Report

1. **Select Filters:**
   - **Report Type**: Patient Visits (default)
   - **Date Range**: Click and select start date
   - **Department**: Choose from dropdown
   - **Doctor**: Choose specific doctor

2. **Click "Generate Report"**

3. **View Results in 3 Tabs:**
   - **Charts** 📈 - Visual graphs
   - **Tables** 📋 - Patient details
   - **Summary** 📊 - Key metrics

---

## 🎯 Quick Examples

### Example 1: Last 7 Days Performance
```
1. Set Date Range: 
   - Start: [7 days ago]
   - End: [today]
2. Keep others as "All"
3. Click "Generate Report"
```

**What You'll See:**
- Line chart showing daily visits
- Donut chart of service distribution
- Average visits, peak hours, utilization rate

### Example 2: Cardiology Department Analysis
```
1. Department: Select "Cardiology"
2. Date Range: Leave empty (all time)
3. Click "Generate Report"
```

**What You'll See:**
- Only cardiology data
- Cardiology-specific service breakdown
- Patient list for cardiology

### Example 3: Doctor Performance
```
1. Doctor: Select "Dr. Ethan Carter"
2. Date Range: Last 30 days
3. Click "Generate Report"
```

**What You'll See:**
- Dr. Carter's patient visits
- His service distribution
- His appointment details

---

## 🔍 Understanding the Reports

### Charts Tab
**Patient Visits Over Time** (Line Chart)
- Shows visit trends by date
- Helps identify busy/slow periods
- X-axis: Dates | Y-axis: Visit count

**Service Utilization** (Donut Chart)
- Shows service type breakdown
- Displays percentages
- Color-coded by service:
  - 🔵 Consultation
  - 🟢 Therapy
  - 🟡 Surgery
  - 🟠 Rehab
  - 🟣 Other

### Tables Tab
Displays detailed patient information:
- Patient Name
- Visit Date (clickable, blue text)
- Doctor Name (blue text)
- Department (blue text)
- Service Type (blue text)

**Limited to 100 records** for performance

### Summary Tab
Three key metrics:

**Average Daily Visits**
- Total visits ÷ Number of days
- Large number display
- Example: 250

**Peak Hours**
- Busiest appointment time window
- 3-hour window format
- Example: "10 AM - 1 PM"

**Utilization Rate**
- Percentage of capacity used
- Formula: (Visits ÷ Capacity) × 100
- Example: 80%

---

## 🛠️ Troubleshooting

### No Data Displayed
**Message**: "No data available for the selected parameters."

**Solutions:**
1. Reset filters (click "Reset Filters" button)
2. Widen date range
3. Select "All Departments" and "All Doctors"
4. Check if appointments exist in database

### Yellow Warning Banner
**Message**: "Unable to retrieve data. Please try again later."

**Solutions:**
1. Check database connection
2. Verify MongoDB is running
3. Check `.env.local` for `MONGODB_URI`
4. Restart the development server

### Charts Not Showing
**Possible Causes:**
- No data in selected range
- Browser compatibility (use modern browser)
- JavaScript disabled

**Solutions:**
1. Try different date range
2. Clear browser cache
3. Check browser console for errors

### Unauthorized Access
**Error**: Can't access page or redirected

**Solutions:**
1. Ensure logged in as admin/healthcare manager
2. Check user role in database
3. Use admin credentials: `admin@healthcare.com`

---

## 💡 Tips & Best Practices

### For Best Performance
- ✅ Use specific date ranges (avoid "all time" with large datasets)
- ✅ Filter by department or doctor when possible
- ✅ Generate reports during off-peak hours for large datasets

### For Accurate Insights
- ✅ Compare similar time periods (week-to-week, month-to-month)
- ✅ Consider seasonal variations
- ✅ Cross-reference with staffing schedules

### For Decision Making
- ✅ Use Summary tab for quick KPIs
- ✅ Use Charts tab to identify trends
- ✅ Use Tables tab for detailed investigation
- ✅ Export data (future feature) for presentations

---

## 📝 Common Use Cases

### 1. Weekly Staff Meeting
**Goal**: Review last week's performance

**Steps:**
1. Set date range: Last 7 days
2. Generate report
3. Check Summary tab for KPIs
4. Review Charts for trends
5. Discuss findings with team

### 2. Monthly Resource Planning
**Goal**: Plan next month's staffing

**Steps:**
1. Compare last 3 months data
2. Identify Peak Hours
3. Check Utilization Rate
4. Adjust schedules based on patterns

### 3. Department Budget Review
**Goal**: Analyze department efficiency

**Steps:**
1. Filter by specific department
2. Review service utilization
3. Check average daily visits
4. Compare with budget allocations

### 4. Doctor Performance Evaluation
**Goal**: Review individual doctor metrics

**Steps:**
1. Select specific doctor
2. Set evaluation period (e.g., quarter)
3. Check patient volume
4. Review service types handled

---

## 🔐 Admin Setup

### Create Admin User
If admin account doesn't exist:

1. **Register a new user** at `/register`
2. **Update user role** in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@healthcare.com" },
  { $set: { role: "admin" } }
)
```

### Grant Manager Access
To give healthcare manager privileges:

1. Login to MongoDB
2. Update user document:
```javascript
db.users.updateOne(
  { email: "manager@healthcare.com" },
  { $set: { role: "admin", name: "Healthcare Manager" } }
)
```

---

## 📚 Additional Resources

- **Full Documentation**: See `STATISTICAL_REPORTS.md`
- **API Reference**: `/api/reports` endpoint
- **Use Case Document**: Use Case 03 in requirements

---

## 🎯 Next Steps

After generating reports, you can:

1. **Take Action** based on insights:
   - Adjust staff schedules
   - Allocate resources
   - Plan service expansions

2. **Share Findings**:
   - Discuss with management team
   - Present to stakeholders
   - Use in planning meetings

3. **Regular Monitoring**:
   - Generate weekly reports
   - Track month-over-month changes
   - Monitor utilization trends

4. **Future Enhancements** (Coming Soon):
   - Export to PDF/Excel
   - Email scheduled reports
   - Financial metrics integration

---

## ✅ Success Checklist

Mark when completed:
- [ ] Successfully logged in as admin
- [ ] Accessed /admin/reports page
- [ ] Generated default report
- [ ] Applied custom filters
- [ ] Viewed Charts tab
- [ ] Viewed Tables tab
- [ ] Viewed Summary tab
- [ ] Reset filters
- [ ] Generated department-specific report
- [ ] Generated doctor-specific report

---

**Need Help?**
- Check the full documentation in `STATISTICAL_REPORTS.md`
- Review the API implementation in `/api/reports/route.ts`
- Inspect the page component in `/admin/reports/page.tsx`

---

*Quick Start Guide v1.0 - October 16, 2025*
