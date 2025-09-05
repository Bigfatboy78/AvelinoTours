export async function sendEmail( summaryHtml ) {
    const payload = {
        subject: "Your Booking Summary",
        html: summaryHtml
    };

    try {
        const res = await fetch("https://ltuyotcnmytiffsznxvd.supabase.co/functions/v1/sendBookingEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Failed to send email:", res.status, data);
            alert("Submission Failure. Please reload the page and try again. If the problem persists please click the Contact Page and talk with our Sales Representative.")
        } else {
            console.log("Email sent:", data);
            alert("Submission Successful! A Sales Representative will contact you shortly confirming the details.")
        }
    } catch (err) {
        alert("Something has gone wrong with the connection. Please reload the page and try again. If the problem persists please click the Contact Page and talk with our Sales Representative.")
        console.error("Network error sending email:", err);
    }
}   

/**
 * 
 * @param {string} phone 
 */
export function normalizePhoneNumber( phone ) { 
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Format to standard US format if 10 digits
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    // Format to international format if 11 digits and starts with 1
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // Return original input if format is unexpected
    return phone;
}

