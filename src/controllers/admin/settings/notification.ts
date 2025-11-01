import { Request, Response } from 'express';
import { AdminSettingsService } from '../../../services/admin/settings/admin';

export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const settings = await AdminSettingsService.getNotificationSettings(userId);

    return res.status(200).json({
      success: true,
      message: 'Notification settings retrieved successfully',
      data: settings
    });
  } catch (error: any) {
    console.error('Get notification settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const settings = await AdminSettingsService.updateNotifications(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
