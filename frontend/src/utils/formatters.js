export const formatDateTime = (dateString) => {
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear() + 543; 
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${day}/${month}/${year}, ${time}`;
    } catch (e) { return 'Invalid Date'; }
};

export const formatTicketID = (id) => { 
    return `TK-${String(id).padStart(3, '0')}`; 
};