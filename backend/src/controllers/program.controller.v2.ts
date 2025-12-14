import { createProgramService, getAllProgramsService, getProgramByIdService, updateProgramService, publishProgramService, cancelProgramService } from '../services/program.service.v2.js';

// Create new program
export const createProgram = async (req, res) => {
  try {
    const result = await createProgramService(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        field: result.field
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const status = req.query.status;
    const filters = status ? { status } : {};

    const result = await getAllProgramsService(filters);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      count: result.count,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get program by ID
export const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProgramByIdService(id);
    
    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Update program
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProgramService(id, req.body);
    
    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        field: result.field
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Publish program (set status to APPROVED)
export const publishProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await publishProgramService(id);
    
    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Cancel program
export const cancelProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await cancelProgramService(id, reason);
    
    if (!result.success) {
      const statusCode = result.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
