// Component QuizCard: Hiển thị một thẻ (card) cho mỗi quiz với các thông tin và tùy chọn tương tác
import React, { memo } from 'react';
// Import các component từ thư viện Ant Design và React Icons
import { Card, Tag, Button, Dropdown, Tooltip, Typography } from 'antd';
import { FiEye, FiEdit, FiMoreVertical, FiFileText, FiUsers, FiTrash2, FiCopy } from 'react-icons/fi';
import { IoShareSocialOutline } from 'react-icons/io5';
import { useSnackbar } from 'notistack';
import { Quiz } from '@/types/database';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

// Định nghĩa kiểu dữ liệu cho props của component
interface QuizCardProps {
    quiz: Quiz;                 // Thông tin về quiz
    onDelete: (id: number) => void; // Hàm xử lý khi xóa quiz
    isDarkMode: boolean;        // Chế độ giao diện tối/sáng
}

// Hàm xác định màu sắc dựa trên độ khó của quiz
const getDifficultyColor = (difficulty: string) => {
    return difficulty === 'EASY'
        ? 'success'
        : difficulty === 'MEDIUM'
            ? 'processing'
            : 'error';
};

// Component QuizCard được tối ưu hóa với memo để tránh render lại không cần thiết
const QuizCard = memo(({ quiz, onDelete, isDarkMode }: QuizCardProps) => {
    // Hook để hiển thị thông báo
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const t = useTranslations('quizzes');
    const c = useTranslations('common');

    // Tạo menu cho dropdown với các tùy chọn
    const getQuizMenu = () => ({
        items: [
            {
                key: '1',
                label: c('view'),      // Xem quiz
                icon: <FiEye />,
                onClick: () => enqueueSnackbar('View Quiz Feature Coming Soon', { variant: 'info' })
            },
            {
                key: '2',
                label: c('edit'),      // Chỉnh sửa quiz
                icon: <FiEdit />,
                onClick: () => router.push(`/quizzes/${quiz.id}`)  // Cập nhật để chuyển đến trang edit
            },
            {
                key: '3',
                label: t('duplicateQuiz'), // Nhân bản quiz
                icon: <FiCopy />,
                onClick: () => enqueueSnackbar('Duplicate Quiz Feature Coming Soon', { variant: 'info' })
            },
            {
                key: '4',
                label: t('shareQuiz'),     // Chia sẻ quiz
                icon: <IoShareSocialOutline />,
                onClick: () => enqueueSnackbar('Share Quiz Feature Coming Soon', { variant: 'info' })
            },
            {
                key: '5',
                label: t('deleteQuiz'),    // Xóa quiz
                icon: <FiTrash2 />,
                danger: true,
                onClick: () => onDelete(quiz.id)
            },
        ]
    });

    return (
        <Card
            hoverable
            // Lớp CSS cho thẻ, thay đổi tùy thuộc vào chế độ giao diện tối/sáng
            className={`h-full overflow-hidden ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'hover:shadow-lg'} transition-all`}
            cover={
                // Phần cover của thẻ, hiển thị hình ảnh quiz và thông tin cơ bản
                <div className="relative h-48">
                    <img
                        alt={quiz.title}
                        // Sử dụng hình ảnh từ URL hoặc tạo hình placeholder với màu tương ứng với độ khó
                        src={quiz.quizThumbnails || `https://placehold.co/600x400/${['3b82f6', '8b5cf6', 'ec4899'][['EASY', 'MEDIUM', 'HARD'].indexOf(quiz.difficulty)]}/ffffff?text=${quiz.title}`}
                        className="object-cover h-full w-full"
                    />
                    <div className="absolute top-2 right-2">
                        {/* Hiển thị trạng thái công khai/riêng tư của quiz */}
                        <Tag color={quiz.isPublic ? 'success' : 'default'}>
                            {quiz.isPublic ? t('statusPublic') : t('statusPrivate')}
                        </Tag>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-2 px-4">
                        <div className="flex flex-wrap gap-1">
                            {/* Hiển thị danh sách danh mục của quiz (tối đa 2 mục) */}
                            {quiz.categoryNames.slice(0, 2).map((category, index) => (
                                <Tag key={index} color="blue" className="text-xs">
                                    {category}
                                </Tag>
                            ))}
                            {quiz.categoryNames.length > 2 && (
                                <Tag color="blue" className="text-xs">
                                    +{quiz.categoryNames.length - 2}
                                </Tag>
                            )}

                            {/* Hiển thị độ khó của quiz */}
                            <Tag color={getDifficultyColor(quiz.difficulty)}>
                                {quiz.difficulty === 'EASY'
                                    ? t('easyDifficulty')
                                    : quiz.difficulty === 'MEDIUM'
                                        ? t('mediumDifficulty')
                                        : t('hardDifficulty')}
                            </Tag>
                        </div>
                    </div>
                </div>
            }
            // Các nút tương tác chính ở phía dưới thẻ
            actions={[
                <Tooltip title={c('view')} key="view">
                    <Button type="text" icon={<FiEye />} />
                </Tooltip>,
                <Tooltip title={c('edit')} key="edit">
                    <Button
                        type="text"
                        icon={<FiEdit />}
                        onClick={() => router.push(`/quizzes/${quiz.id}`)}
                    />
                </Tooltip>,
                <Dropdown key="more" menu={getQuizMenu()} trigger={['click']} placement="bottomRight">
                    <Button type="text" icon={<FiMoreVertical />} />
                </Dropdown>
            ]}
        >
            {/* Phần nội dung chính của thẻ */}
            <div className="flex flex-col h-32">
                {/* Title được chuyển vào body */}
                <Text className="font-semibold text-lg mb-2 line-clamp-2"
                    style={{ color: isDarkMode ? 'white' : 'inherit' }}>
                    {quiz.title}
                </Text>

                {/* Mô tả ngắn về quiz */}
                <Text className="text-xs text-gray-500 line-clamp-2 mb-auto">{quiz.description}</Text>

                {/* Thông tin thống kê: số câu hỏi và số lần chơi */}
                <div className="mt-auto pt-2 flex justify-between items-center text-xs border-t border-gray-200 dark:border-gray-700">
                    <span className="flex items-center">
                        <FiFileText className="mr-1" /> {quiz.questionCount} {t('columnQuestions').toLowerCase()}
                    </span>
                    <span className="flex items-center">
                        <FiUsers className="mr-1" /> {quiz.playCount} {t('columnPlayCount').toLowerCase()}
                    </span>
                </div>
            </div>
        </Card>
    );
});

// Đặt tên hiển thị cho component (cần thiết khi sử dụng memo)
QuizCard.displayName = 'QuizCard';

export default QuizCard;