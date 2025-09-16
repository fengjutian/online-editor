// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// 默认日志级别
let currentLogLevel: LogLevel = LogLevel.DEBUG;

/**
 * 设置日志级别
 * @param level 日志级别
 */
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
};

/**
 * 获取当前日志级别
 * @returns 当前日志级别
 */
export const getLogLevel = (): LogLevel => {
  return currentLogLevel;
};

/**
 * 获取当前时间戳
 * @returns 格式化的时间戳字符串
 */
const getTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * 日志工具类
 */
export const logger = {
  /**
   * 调试日志
   * @param message 日志消息
   * @param optionalParams 可选参数
   */
  debug: (message: string, ...optionalParams: any[]): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(
        `%c[DEBUG] ${getTimestamp()} ${message}`,
        'color: blue; font-weight: normal;',
        ...optionalParams
      );
    }
  },

  /**
   * 信息日志
   * @param message 日志消息
   * @param optionalParams 可选参数
   */
  info: (message: string, ...optionalParams: any[]): void => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(
        `%c[INFO] ${getTimestamp()} ${message}`,
        'color: green; font-weight: normal;',
        ...optionalParams
      );
    }
  },

  /**
   * 警告日志
   * @param message 日志消息
   * @param optionalParams 可选参数
   */
  warn: (message: string, ...optionalParams: any[]): void => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(
        `%c[WARN] ${getTimestamp()} ${message}`,
        'color: orange; font-weight: bold;',
        ...optionalParams
      );
    }
  },

  /**
   * 错误日志
   * @param message 日志消息
   * @param optionalParams 可选参数
   */
  error: (message: string, ...optionalParams: any[]): void => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(
        `%c[ERROR] ${getTimestamp()} ${message}`,
        'color: red; font-weight: bold;',
        ...optionalParams
      );
    }
  },

  /**
   * 记录对象详情
   * @param title 对象标题
   * @param obj 要记录的对象
   */
  logObject: (title: string, obj: any): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(`%c[OBJECT] ${getTimestamp()} ${title}:`, 'color: purple; font-weight: normal;');
      console.dir(obj, { depth: null, colors: true });
    }
  }
};

export default logger;


/**
 * // 导入日志工具
import logger, { LogLevel, setLogLevel } from './utils/logger';

// 设置日志级别（可选）
setLogLevel(LogLevel.INFO); // 只显示INFO及以上级别的日志

// 记录不同级别的日志
logger.debug('这是一条调试日志');
logger.info('这是一条信息日志');
logger.warn('这是一条警告日志');
logger.error('这是一条错误日志');

// 记录对象详情
const userInfo = { name: '张三', age: 25, role: 'admin' };
logger.logObject('用户信息', userInfo);
 */