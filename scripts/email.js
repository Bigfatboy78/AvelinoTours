export let userEmail = "trey.pubins@gmail.com";

export async function sendEmail( userEmail, summaryHtml ) {
    const payload = {
    to: userEmail,
    subject: "Your Booking Summary",
    html: summaryHtml
    };

    await fetch("https://ltuyotcnmytiffsznxvd.supabase.co/functions/v1/sendBookingEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
    });
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

