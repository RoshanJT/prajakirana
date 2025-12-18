export interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'Individual' | 'Corporate' | 'Recurring';
    status: 'Active' | 'Inactive';
    lastDonationDate: string;
    totalDonated: number;
}

export const initialDonors: Donor[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 890',
        type: 'Individual',
        status: 'Active',
        lastDonationDate: '2023-11-15',
        totalDonated: 500,
    },
    {
        id: '2',
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '+1 987 654 321',
        type: 'Corporate',
        status: 'Active',
        lastDonationDate: '2023-10-01',
        totalDonated: 5000,
    },
    {
        id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 555 123 456',
        type: 'Recurring',
        status: 'Active',
        lastDonationDate: '2023-12-01',
        totalDonated: 1200,
    },
];

export const getDonors = async (): Promise<Donor[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => resolve(initialDonors), 500);
    });
};
