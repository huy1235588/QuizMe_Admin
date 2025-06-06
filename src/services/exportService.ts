import * as XLSX from 'xlsx';
import { UserResponse } from '@/types/database';

export interface ExportOptions {
    format: 'excel' | 'csv';
    includeFields?: string[];
    fileName?: string;
}

/**
 * Service for exporting user data
 */
export class ExportService {
    /**
     * Xuất dữ liệu người dùng ra file Excel
     */
    static async exportUsersToExcel(
        users: UserResponse[],
        options: ExportOptions = { format: 'excel' }
    ): Promise<void> {
        try {
            const { fileName = 'danh-sach-nguoi-dung', includeFields } = options;

            // Chuẩn bị dữ liệu xuất
            const exportData = this.prepareUserDataForExport(users, includeFields);

            // Tạo workbook và worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Thiết lập chiều rộng cột tự động
            const columnWidths = this.calculateColumnWidths(exportData);
            worksheet['!cols'] = columnWidths;

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách người dùng');

            // Xuất file
            const currentDate = new Date().toISOString().split('T')[0];
            const finalFileName = `${fileName}_${currentDate}.xlsx`;

            XLSX.writeFile(workbook, finalFileName);

            return Promise.resolve();
        } catch (error) {
            console.error('Error exporting users to Excel:', error);
            throw new Error('Có lỗi xảy ra khi xuất dữ liệu');
        }
    }

    /**
     * Xuất dữ liệu người dùng ra file CSV
     */
    static async exportUsersToCSV(
        users: UserResponse[],
        options: ExportOptions = { format: 'csv' }
    ): Promise<void> {
        try {
            const { fileName = 'danh-sach-nguoi-dung', includeFields } = options;

            // Chuẩn bị dữ liệu xuất
            const exportData = this.prepareUserDataForExport(users, includeFields);

            // Tạo workbook và worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách người dùng');

            // Xuất file CSV
            const currentDate = new Date().toISOString().split('T')[0];
            const finalFileName = `${fileName}_${currentDate}.csv`;

            XLSX.writeFile(workbook, finalFileName, { bookType: 'csv' });

            return Promise.resolve();
        } catch (error) {
            console.error('Error exporting users to CSV:', error);
            throw new Error('Có lỗi xảy ra khi xuất dữ liệu');
        }
    }

    /**
     * Chuẩn bị dữ liệu người dùng để xuất
     */
    private static prepareUserDataForExport(
        users: UserResponse[],
        includeFields?: string[]
    ): any[] {
        const defaultFields = [
            'id',
            'username',
            'email',
            'fullName',
            'role',
            'isActive',
            'lastLogin',
            'createdAt',
            'updatedAt'
        ];

        const fieldsToInclude = includeFields || defaultFields;

        return users.map(user => {
            const exportUser: any = {};

            fieldsToInclude.forEach(field => {
                switch (field) {
                    case 'id':
                        exportUser['ID'] = user.id;
                        break;
                    case 'username':
                        exportUser['Tên đăng nhập'] = user.username;
                        break;
                    case 'email':
                        exportUser['Email'] = user.email;
                        break; case 'fullName':
                        exportUser['Họ và tên'] = user.fullName;
                        break;
                    case 'lastLogin':
                        exportUser['Đăng nhập lần cuối'] = user.lastLogin ? this.formatDate(user.lastLogin) : 'Chưa đăng nhập';
                        break;
                    case 'role':
                        exportUser['Vai trò'] = this.getRoleDisplayName(user.role);
                        break;
                    case 'isActive':
                        exportUser['Trạng thái'] = user.isActive ? 'Hoạt động' : 'Bị khóa';
                        break;
                    case 'createdAt':
                        exportUser['Ngày tạo'] = this.formatDate(user.createdAt);
                        break;
                    case 'updatedAt':
                        exportUser['Ngày cập nhật'] = user.updatedAt ? this.formatDate(user.updatedAt) : 'Chưa cập nhật';
                        break;
                    default:
                        if (user[field as keyof UserResponse] !== undefined) {
                            exportUser[field] = user[field as keyof UserResponse];
                        }
                        break;
                }
            });

            return exportUser;
        });
    }

    /**
     * Tính toán chiều rộng cột tự động
     */
    private static calculateColumnWidths(data: any[]): any[] {
        if (data.length === 0) return [];

        const columns = Object.keys(data[0]);
        return columns.map(column => {
            const maxLength = Math.max(
                column.length,
                ...data.map(row => String(row[column] || '').length)
            );
            return { wch: Math.min(maxLength + 2, 50) }; // Giới hạn độ rộng tối đa là 50
        });
    }

    /**
     * Định dạng ngày tháng
     */
    private static formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Lấy tên hiển thị của vai trò
     */
    private static getRoleDisplayName(role: string): string {
        const roleMap: { [key: string]: string } = {
            'ADMIN': 'Quản trị viên',
            'TEACHER': 'Giáo viên',
            'STUDENT': 'Học sinh',
            'USER': 'Người dùng'
        };

        return roleMap[role.toUpperCase()] || role;
    }

    /**
     * Xuất dữ liệu với định dạng tùy chọn
     */
    static async exportUsers(
        users: UserResponse[],
        options: ExportOptions
    ): Promise<void> {
        if (options.format === 'csv') {
            return this.exportUsersToCSV(users, options);
        } else {
            return this.exportUsersToExcel(users, options);
        }
    }

    /**
     * Tạo template Excel cho import dữ liệu người dùng
     */
    static async createUserImportTemplate(): Promise<void> {
        try {
            const templateData = [
                {
                    'Tên đăng nhập': 'user001',
                    'Email': 'user001@example.com',
                    'Họ và tên': 'Nguyễn Văn A',
                    'Vai trò': 'USER',
                    'Trạng thái': 'Hoạt động'
                }
            ];

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(templateData);

            // Thiết lập chiều rộng cột
            const columnWidths = this.calculateColumnWidths(templateData);
            worksheet['!cols'] = columnWidths;

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');

            // Xuất file template
            const fileName = `template-import-nguoi-dung_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            return Promise.resolve();
        } catch (error) {
            console.error('Error creating import template:', error);
            throw new Error('Có lỗi xảy ra khi tạo template import');
        }
    }
}
