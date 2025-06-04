import React from 'react';
import { Card, Tag, Progress, Typography, Button } from 'antd';
import { FiUsers, FiEye } from 'react-icons/fi';
import { BsArrowUpRight } from 'react-icons/bs';
import { HiOutlineStar } from 'react-icons/hi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Quiz } from '@/types/database';
import { useTranslations } from 'next-intl';

// Import Swiper styles
// Import các styles của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const { Text } = Typography;

// Interface định nghĩa các props cho component TrendingQuizzes
interface TrendingQuizzesProps {
    quizzes: Quiz[]; // Mảng các quiz đang thịnh hành
    isDarkMode: boolean; // Trạng thái chế độ tối
}

// Component hiển thị danh sách các bài quiz đang thịnh hành
const TrendingQuizzes: React.FC<TrendingQuizzesProps> = ({ quizzes, isDarkMode }) => {
    const t = useTranslations('quizzes');

    // Nếu không có dữ liệu quiz hoặc mảng rỗng thì không hiển thị gì
    if (!quizzes || quizzes.length === 0) {
        return null;
    }

    return (
        <Card
            // Tiêu đề card với biểu tượng ngôi sao
            title={<span className="font-bold flex items-center"><HiOutlineStar className="mr-2 text-amber-500" /> {t('trendingQuizzes')}</span>}
            variant='outlined'
            // Style cho card dựa vào chế độ tối/sáng
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden`}
            // Nút xem tất cả ở góc phải
            extra={<Button type="link" icon={<FiEye className="mr-1" />}>{t('viewAll')}</Button>}
        >
            {/* Swiper component để hiển thị quiz dạng carousel */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                // Tự động chuyển slide sau mỗi 5 giây
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="trending-quizzes-swiper mb-4"
                // Các breakpoint responsive cho số lượng slide hiển thị theo kích thước màn hình
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                    1280: {
                        slidesPerView: 5,
                    },
                }}
            >
                {/* Map qua mảng quizzes để render từng quiz card */}
                {quizzes.map((quiz, index) => (
                    <SwiperSlide key={index}>
                        <Card
                            hoverable
                            // Style cho card quiz với hiệu ứng hover
                            className={`trending-quiz-card h-full overflow-hidden relative ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} transition-all duration-300 shadow-sm hover:shadow-md`}
                            cover={
                                <div className="relative h-36 overflow-hidden">
                                    {/* Hình ảnh thumbnail của quiz hoặc hình placeholder có màu ngẫu nhiên nếu không có thumbnail */}
                                    <img
                                        src={quiz.quizThumbnails || `https://placehold.co/400x300/${['3b82f6', '8b5cf6', 'ec4899', '22c55e', 'eab308', '8b5cf6'][index % 6]}/ffffff?text=${quiz.title.charAt(0)}`}
                                        alt={quiz.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    {/* Gradient overlay cho hình ảnh */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <div className="flex items-center">
                                            {/* Tag hiển thị độ khó của quiz với màu khác nhau */}
                                            <Tag
                                                color={
                                                    quiz.difficulty === 'EASY' ? 'success' :
                                                        quiz.difficulty === 'MEDIUM' ? 'processing' : 'error'
                                                }
                                                className="opacity-90"
                                            >
                                                {t(quiz.difficulty.toLowerCase() + 'Difficulty')}
                                            </Tag>
                                            {/* Tag hiển thị danh mục của quiz */}
                                            <Tag color="blue" className="opacity-90">{quiz.categoryNames}</Tag>
                                        </div>
                                    </div>
                                    {/* Hiển thị thứ hạng của quiz với màu khác nhau tùy vào top 3 */}
                                    <div className="absolute top-2 right-2">
                                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-gray-300 text-gray-800' : index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-700/80 text-white'}`}>
                                            #{index + 1}
                                        </div>
                                    </div>
                                </div>
                            }
                        >
                            <div className="relative pb-1">
                                {/* Tiêu đề quiz giới hạn hiển thị 1 dòng */}
                                <Text className={`font-semibold line-clamp-1 text-base ${isDarkMode ? 'text-white' : ''}`} strong>
                                    {quiz.title}
                                </Text>

                                <div className="mt-2 flex justify-between items-center">
                                    {/* Hiển thị số lượt tham gia quiz */}
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <FiUsers className="mr-1" /> {quiz.playCount.toLocaleString()}
                                        </span>
                                    </div>
                                    {/* Hiển thị tỷ lệ tăng trưởng của quiz */}
                                    <div className="flex items-center gap-1">
                                        <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                            <BsArrowUpRight className="mr-1" /> +{Math.floor(quiz.playCount * 0.1)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Thanh tiến trình hiển thị mức độ phổ biến của quiz */}
                                <Progress
                                    percent={Math.min(100, (quiz.playCount / 500) * 100)}
                                    size="small"
                                    strokeColor={{
                                        '0%': '#1890ff',
                                        '100%': '#52c41a',
                                    }}
                                    className="mt-1"
                                    showInfo={false}
                                />
                            </div>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Card>
    );
};

export default TrendingQuizzes;