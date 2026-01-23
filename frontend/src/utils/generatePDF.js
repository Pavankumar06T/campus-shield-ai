import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSafetyReport = (studentCount, atRiskCount, riskLogs, sosAlerts) => {
    try {
        const doc = new jsPDF();

   
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); 
        doc.text("Campus Shield - Safety Audit Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Authorized By: Admin System`, 14, 33);

        
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 40, 180, 25, 'F');

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Executive Summary", 20, 50);

        doc.setFontSize(10);
        doc.text(`Total Active Students: ${studentCount}`, 20, 58);

        const safeCount = Math.max(0, studentCount - atRiskCount);
        doc.setTextColor(0, 150, 0); // Green
        doc.text(`Safe: ${safeCount}`, 80, 58);

        doc.setTextColor(200, 0, 0); // Red
        doc.text(`At High Risk: ${atRiskCount}`, 140, 58);

        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("High Risk Analysis (Privacy Mode Active)", 14, 80);

        
        const riskGroups = Object.values(riskLogs.reduce((acc, log) => {
            if (!acc[log.userId]) {
                acc[log.userId] = {
                    id: log.userId,
                    name: log.studentName || 'Unknown',
                    severity: 'High',
                    count: 0,
                    lastSeen: log.timestamp
                };
            }
            acc[log.userId].count++;
            if (log.severity === 'Critical') acc[log.userId].severity = 'Critical';
            return acc;
        }, {}));

        const riskTableData = riskGroups.map(g => [
            g.severity === 'Critical' ? 'CRITICAL' : 'High Risk',
            g.name, 
            `${g.count} Anomalies Detected`,
            new Date(g.lastSeen?.seconds ? g.lastSeen.seconds * 1000 : Date.now()).toLocaleDateString()
        ]);

        if (riskTableData.length > 0) {
            autoTable(doc, {
                startY: 85,
                head: [['Severity', 'Student Name', 'Pattern Summary', 'Last Active']],
                body: riskTableData,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
        } else {
            doc.setFontSize(10);
            doc.text("No high-risk anomalies detected in the recorded period.", 14, 90);
        }

        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 100;
        doc.setFontSize(14);
        doc.text("Recent Emergency Alerts (SOS)", 14, finalY);

        const sosTableData = sosAlerts.slice(0, 5).map(alert => [
            new Date(alert.timestamp?.seconds * 1000).toLocaleString(),
            alert.student || 'Unknown',
            alert.type || 'General SOS',
            alert.status || 'Active',
            alert.location || 'N/A'
        ]);

        if (sosTableData.length > 0) {
            autoTable(doc, {
                startY: finalY + 5,
                head: [['Time', 'Student', 'Type', 'Status', 'Location']],
                body: sosTableData,
                theme: 'striped',
                headStyles: { fillColor: [192, 57, 43] } // Red header
            });
        } else {
            doc.setFontSize(10);
            doc.text("No recent SOS alerts.", 14, finalY + 10);
        }

        
        doc.save(`CampusShield_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        return true; 
    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error; 
    }
};
