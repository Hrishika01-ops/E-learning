const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { createError } = require('../utils/error');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const thumbnailDir = path.join(uploadDir, 'thumbnails');
    const contentDir = path.join(uploadDir, 'lecture_content');

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir);
    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir);
};

createUploadDirs();

// Upload course thumbnail
exports.uploadThumbnail = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(createError(400, 'No file uploaded'));
        }

        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(__dirname, '..', 'uploads', 'thumbnails', fileName);

        // Write file to disk
        fs.writeFileSync(filePath, req.file.buffer);

        // Return the full URL that can be used to access the file
        const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/thumbnails/${fileName}`;

        res.status(200).json({
            success: true,
            fileUrl
        });
    } catch (error) {
        next(error);
    }
};

// Upload lecture content (now specifically for videos)
exports.uploadContent = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(createError(400, 'No file uploaded'));
        }

        // Validate that it's a video file
        if (!req.file.mimetype.startsWith('video/')) {
            return next(createError(400, 'Only video files are allowed'));
        }

        const fileName = `${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(__dirname, '..', 'uploads', 'lecture_content', fileName);

        // Write file to disk
        fs.writeFileSync(filePath, req.file.buffer);

        // Return the full URL that can be used to access the file
        const videoUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/lecture_content/${fileName}`;

        res.status(200).json({
            success: true,
            fileUrl: videoUrl
        });
    } catch (error) {
        next(error);
    }
};

// Validate content helper function
const validateContent = (content) => {
    if (!content) return [];

    return content.map(item => {
        if (!item.type || !item.title || !item.description) {
            throw createError(400, 'Each content item must have type, title, and description');
        }

        // Base content structure
        const validatedContent = {
            type: item.type,
            title: item.title.trim(),
            description: item.description.trim()
        };

        // Add type-specific fields
        switch (item.type) {
            case 'Video':
                if (item.videoUrl) {
                    validatedContent.videoUrl = item.videoUrl;
                }
                break;

            case 'Youtube Url':
            case 'Resource':
                if (!item.url) {
                    throw createError(400, `${item.type} content must have a URL`);
                }
                validatedContent.url = item.url;
                break;

            case 'Quiz':
                if (!item.quizData?.questions?.length) {
                    throw createError(400, 'Quiz must have at least one question');
                }
                
                // Validate each question
                const questions = item.quizData.questions.map((q, idx) => {
                    if (!q.question || !q.options?.length || q.options.length !== 4) {
                        throw createError(400, `Question ${idx + 1} must have a question and exactly 4 options`);
                    }
                    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
                        throw createError(400, `Question ${idx + 1} must have a valid correct answer that matches one of the options`);
                    }
                    if (typeof q.points !== 'number' || q.points <= 0) {
                        throw createError(400, `Question ${idx + 1} must have valid points (greater than 0)`);
                    }
                    return {
                        question: q.question.trim(),
                        options: q.options.map(opt => opt.trim()),
                        correctAnswer: q.correctAnswer.trim(),
                        points: q.points
                    };
                });

                validatedContent.quizData = {
                    questions,
                    passingScore: item.quizData.passingScore || 70
                };
                break;

            case 'Assignment':
                // Simple assignment with just title and description
                break;

            default:
                throw createError(400, `Invalid content type: ${item.type}`);
        }

        return validatedContent;
    });
};

// Create a new course
exports.createCourse = async (req, res, next) => {
    try {
        const { title, description, category, thumbnail, content } = req.body;

        // First, validate and process the content items
        const processedContent = content.map(item => {
            // Basic validation
            if (!item.type || !item.title || !item.description) {
                throw createError(400, 'Each content item must have type, title, and description');
            }

            // Create base content item
            const processedItem = {
                type: item.type,
                title: item.title.trim(),
                description: item.description.trim()
            };

            // Handle type-specific fields
            switch (item.type) {
                case 'Video':
                    if (!item.videoUrl) {
                        throw createError(400, 'Video content must have a video URL. Please upload the video first.');
                    }
                    processedItem.videoUrl = item.videoUrl;
                    break;

                case 'Youtube Url':
                case 'Resource':
                    if (!item.url) {
                        throw createError(400, `${item.type} content must have a URL`);
                    }
                    processedItem.url = item.url;
                    break;

                case 'Quiz':
                    if (!item.quizData?.questions?.length) {
                        throw createError(400, 'Quiz must have at least one question');
                    }
                    
                    // Validate quiz questions
                    processedItem.quizData = {
                        questions: item.quizData.questions.map((q, idx) => {
                            if (!q.question || !q.options?.length || q.options.length !== 4) {
                                throw createError(400, `Question ${idx + 1} must have a question and exactly 4 options`);
                            }
                            if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
                                throw createError(400, `Question ${idx + 1} must have a valid correct answer that matches one of the options`);
                            }
                            if (typeof q.points !== 'number' || q.points <= 0) {
                                throw createError(400, `Question ${idx + 1} must have valid points (greater than 0)`);
                            }
                            return {
                                question: q.question.trim(),
                                options: q.options.map(opt => opt.trim()),
                                correctAnswer: q.correctAnswer.trim(),
                                points: q.points
                            };
                        }),
                        passingScore: item.quizData.passingScore || 70
                    };
                    break;

                case 'Assignment':
                    // Assignment only needs title and description
                    break;

                default:
                    throw createError(400, `Invalid content type: ${item.type}`);
            }

            return processedItem;
        });

        // Create the course with processed content
        const course = await Course.create({
            title,
            description,
            category,
            thumbnail,
            content: processedContent,
            instructor: req.user._id
        });

        // Add course to instructor's created courses
        await User.findByIdAndUpdate(req.user._id, {
            $push: { createdCourses: course._id }
        });

        res.status(201).json({
            success: true,
            data: course,
            courseId: course._id
        });
    } catch (error) {
        next(error);
    }
};

// Get all courses (with filters and pagination)
exports.getAllCourses = async (req, res, next) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        const query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get course by ID
exports.getCourseById = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
};

// Update course
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You are not authorized to update this course'));
        }

        const updateData = { ...req.body };

        // If content is being updated, process it
        if (updateData.content) {
            updateData.content = updateData.content.map(item => {
                const processedItem = {
                    type: item.type,
                    title: item.title.trim(),
                    description: item.description.trim()
                };

                switch (item.type) {
                    case 'Video':
                        if (!item.videoUrl) {
                            throw createError(400, 'Video content must have a video URL. Please upload the video first.');
                        }
                        processedItem.videoUrl = item.videoUrl;
                        break;

                    case 'Youtube Url':
                    case 'Resource':
                        if (!item.url) {
                            throw createError(400, `${item.type} content must have a URL`);
                        }
                        processedItem.url = item.url;
                        break;

                    case 'Quiz':
                        if (!item.quizData?.questions?.length) {
                            throw createError(400, 'Quiz must have at least one question');
                        }
                        processedItem.quizData = {
                            questions: item.quizData.questions.map((q, idx) => ({
                                question: q.question.trim(),
                                options: q.options.map(opt => opt.trim()),
                                correctAnswer: q.correctAnswer.trim(),
                                points: q.points
                            })),
                            passingScore: item.quizData.passingScore || 70
                        };
                        break;

                    case 'Assignment':
                        break;

                    default:
                        throw createError(400, `Invalid content type: ${item.type}`);
                }

                return processedItem;
            });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('instructor', 'name email');

        res.status(200).json({
            success: true,
            data: updatedCourse
        });
    } catch (error) {
        next(error);
    }
};

// Delete course
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You are not authorized to delete this course'));
        }

        await Course.deleteOne({ _id: req.params.id });

        // Remove course from instructor's created courses
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { createdCourses: course._id }
        });

        // Remove course from enrolled students
        await User.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Enroll in course
exports.enrollInCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.enrolledStudents.includes(req.user._id)) {
            return next(createError(400, 'You are already enrolled in this course'));
        }

        course.enrolledStudents.push(req.user._id);
        await course.save();

        // Add course to student's enrolled courses
        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledCourses: course._id }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully enrolled in course'
        });
    } catch (error) {
        next(error);
    }
};

// Unenroll from course
exports.unenrollFromCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (!course.enrolledStudents.includes(req.user._id)) {
            return next(createError(400, 'You are not enrolled in this course'));
        }

        course.enrolledStudents = course.enrolledStudents.filter(
            id => id.toString() !== req.user._id.toString()
        );
        await course.save();

        // Remove course from student's enrolled courses
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { enrolledCourses: course._id }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    } catch (error) {
        next(error);
    }
};

// Get enrolled courses
exports.getEnrolledCourses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('enrolledCourses');

        res.status(200).json({
            success: true,
            data: user.enrolledCourses
        });
    } catch (error) {
        next(error);
    }
};

// Get instructor courses
exports.getInstructorCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .select('title description category thumbnail content status createdAt')
            .populate('enrolledStudents', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

// Add lesson to course
exports.addLesson = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You are not authorized to add lessons to this course'));
        }

        course.lessons.push(req.body);
        await course.save();

        res.status(201).json({
            success: true,
            data: course.lessons[course.lessons.length - 1]
        });
    } catch (error) {
        next(error);
    }
};

// Get lesson by ID
exports.getLessonById = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        const lesson = course.lessons.id(req.params.lessonId);

        if (!lesson) {
            return next(createError(404, 'Lesson not found'));
        }

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        next(error);
    }
};

// Update lesson
exports.updateLesson = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You are not authorized to update lessons in this course'));
        }

        const lesson = course.lessons.id(req.params.lessonId);

        if (!lesson) {
            return next(createError(404, 'Lesson not found'));
        }

        Object.assign(lesson, req.body);
        await course.save();

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        next(error);
    }
};

// Delete lesson
exports.deleteLesson = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return next(createError(404, 'Course not found'));
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You are not authorized to delete lessons from this course'));
        }

        course.lessons.id(req.params.lessonId).remove();
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};