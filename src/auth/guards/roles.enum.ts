export enum Role {
    ADMIN = 'admin',
    STUDENT = 'student',
    TEACHER = 'teacher',
    SUPERADMIN = 'superadmin',
    SUPPORTADMIN = 'supportadmin'
}

export enum DetailsRequestStatus{
    PENDING = 'pending',
    COMPLETED = 'completed',
}

export enum ModuleType{
    COURSE = 'full-course',
    MAINS = 'mains',
    PRELIMS = 'prelims',
    NOTES = 'notes'
}

export enum enrollmentStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired'
}

export enum couponStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired'
}

export enum orderStatus {
    PENDING = 'pending',
    SHIPPED = 'shipped',
    OUT_FOR_DELIVERY = 'Out for Delivery',
    DELIVERED = 'delivered'
}