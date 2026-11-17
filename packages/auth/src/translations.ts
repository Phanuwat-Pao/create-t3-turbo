/**
 * Thai for Better Auth's server error messages, consumed by the Better Auth
 * i18n plugin in `./index.ts`. The plugin looks up `body.code` of an error
 * response under the request's locale and replaces the message; a code with
 * no entry keeps Better Auth's English message. English is Better Auth's own
 * text, so only Thai is listed.
 */

/**
 * Every code in the auth instance's `$ERROR_CODES`: core plus the plugins
 * that declare theirs (organization, twoFactor, admin, multiSession,
 * deviceAuthorization, username, passkey). `translations.test.ts` fails when
 * a code is missing here or no longer exists.
 */
export const errorCodeTranslations: Record<string, string> = {
  ACCESS_DENIED: "ถูกปฏิเสธการเข้าถึง",
  ACCOUNT_NOT_FOUND: "ไม่พบบัญชี",
  ACCOUNT_TEMPORARILY_LOCKED:
    "บัญชีถูกล็อกชั่วคราวจากการยืนยันที่ผิดพลาดหลายครั้ง กรุณาลองใหม่ภายหลัง",
  ASYNC_VALIDATION_NOT_SUPPORTED: "ไม่รองรับการตรวจสอบข้อมูลแบบ async",
  AUTHENTICATION_FAILED: "ยืนยันตัวตนไม่สำเร็จ",
  AUTHENTICATION_REQUIRED: "ต้องยืนยันตัวตนก่อน",
  AUTHORIZATION_PENDING: "กำลังรอการอนุมัติ",
  AUTH_CANCELLED: "ยกเลิกการยืนยันตัวตนแล้ว",
  BACKUP_CODES_NOT_ENABLED: "ยังไม่ได้เปิดใช้งานรหัสสำรอง",
  BANNED_USER: "คุณถูกแบนจากแอปพลิเคชันนี้",
  BODY_MUST_BE_AN_OBJECT: "เนื้อหาคำขอต้องเป็นออบเจ็กต์",
  CALLBACK_URL_REQUIRED: "ต้องระบุ callbackURL",
  CANNOT_DELETE_A_PRE_DEFINED_ROLE: "ไม่สามารถลบบทบาทที่ระบบกำหนดไว้ได้",
  CHALLENGE_NOT_FOUND: "ไม่พบ challenge สำหรับยืนยันตัวตน",
  CHANGE_EMAIL_DISABLED: "ไม่ได้เปิดให้เปลี่ยนอีเมล",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "ไม่พบบัญชีที่ใช้รหัสผ่าน",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED:
    "ระบบบล็อกการเข้าสู่ระบบที่มาจากเว็บไซต์อื่น เนื่องจากคำขอนี้อาจเป็นการโจมตีแบบ CSRF",
  DEVICE_CODE_ALREADY_PROCESSED: "รหัสอุปกรณ์นี้ถูกดำเนินการไปแล้ว",
  DEVICE_CODE_NOT_CLAIMED:
    "ยังไม่มีเซสชันใดยืนยันรหัสอุปกรณ์นี้ กรุณาเรียก GET /device พร้อม user_code ขณะเข้าสู่ระบบอยู่ ก่อนอนุมัติหรือปฏิเสธ",
  EMAIL_ALREADY_VERIFIED: "อีเมลได้รับการยืนยันแล้ว",
  EMAIL_CAN_NOT_BE_UPDATED: "ไม่สามารถเปลี่ยนอีเมลได้",
  EMAIL_MISMATCH: "อีเมลไม่ตรงกัน",
  EMAIL_NOT_VERIFIED: "อีเมลยังไม่ได้รับการยืนยัน",
  EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION:
    "กรุณายืนยันอีเมลก่อนยอมรับหรือปฏิเสธคำเชิญ",
  EMAIL_VERIFICATION_REQUIRED_FOR_INVITATION: "กรุณายืนยันอีเมลก่อนดูคำเชิญที่ส่งถึงอีเมลนี้",
  EXPIRED_DEVICE_CODE: "รหัสอุปกรณ์หมดอายุแล้ว",
  EXPIRED_USER_CODE: "รหัสผู้ใช้หมดอายุแล้ว",
  FAILED_TO_CREATE_SESSION: "สร้างเซสชันไม่สำเร็จ",
  FAILED_TO_CREATE_USER: "สร้างผู้ใช้ไม่สำเร็จ",
  FAILED_TO_CREATE_VERIFICATION: "สร้างรายการยืนยันไม่สำเร็จ",
  FAILED_TO_GET_SESSION: "ดึงข้อมูลเซสชันไม่สำเร็จ",
  FAILED_TO_GET_USER_INFO: "ดึงข้อมูลผู้ใช้ไม่สำเร็จ",
  FAILED_TO_RETRIEVE_INVITATION: "ดึงข้อมูลคำเชิญไม่สำเร็จ",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "ไม่สามารถยกเลิกการเชื่อมต่อบัญชีสุดท้ายได้",
  FAILED_TO_UPDATE_PASSKEY: "อัปเดต Passkey ไม่สำเร็จ",
  FAILED_TO_UPDATE_USER: "อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ",
  FAILED_TO_VERIFY_REGISTRATION: "ยืนยันการลงทะเบียนไม่สำเร็จ",
  FIELD_NOT_ALLOWED: "ไม่อนุญาตให้กำหนดค่าฟิลด์นี้",
  ID_TOKEN_NOT_SUPPORTED: "ไม่รองรับ id_token",
  INVALID_BACKUP_CODE: "รหัสสำรองไม่ถูกต้อง",
  INVALID_CALLBACK_URL: "callbackURL ไม่ถูกต้อง",
  INVALID_CODE: "รหัสไม่ถูกต้อง",
  INVALID_DEVICE_CODE: "รหัสอุปกรณ์ไม่ถูกต้อง",
  INVALID_DEVICE_CODE_STATUS: "สถานะของรหัสอุปกรณ์ไม่ถูกต้อง",
  INVALID_DISPLAY_USERNAME: "ชื่อที่แสดงไม่ถูกต้อง",
  INVALID_EMAIL: "อีเมลไม่ถูกต้อง",
  INVALID_EMAIL_OR_PASSWORD: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  INVALID_ERROR_CALLBACK_URL: "errorCallbackURL ไม่ถูกต้อง",
  INVALID_NEW_USER_CALLBACK_URL: "newUserCallbackURL ไม่ถูกต้อง",
  INVALID_ORIGIN: "Origin ของคำขอไม่ถูกต้อง",
  INVALID_PASSWORD: "รหัสผ่านไม่ถูกต้อง",
  INVALID_REDIRECT_URL: "redirectURL ไม่ถูกต้อง",
  INVALID_RESOURCE: "สิทธิ์ที่ระบุมีทรัพยากรที่ไม่ถูกต้อง",
  INVALID_ROLE_TYPE: "ประเภทบทบาทไม่ถูกต้อง",
  INVALID_SESSION_TOKEN: "โทเค็นเซสชันไม่ถูกต้อง",
  INVALID_TEAM_ID: "รหัสทีมมีอักขระที่ระบบสงวนไว้",
  INVALID_TOKEN: "โทเค็นไม่ถูกต้อง",
  INVALID_TWO_FACTOR_COOKIE: "คุกกี้ของการยืนยันตัวตนสองขั้นตอนไม่ถูกต้อง",
  INVALID_USER: "ผู้ใช้ไม่ถูกต้อง",
  INVALID_USERNAME: "ชื่อผู้ใช้ไม่ถูกต้อง",
  INVALID_USERNAME_OR_PASSWORD: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  INVALID_USER_CODE: "รหัสผู้ใช้ไม่ถูกต้อง",
  INVITATION_LIMIT_REACHED: "คำเชิญครบจำนวนสูงสุดแล้ว",
  INVITATION_NOT_FOUND: "ไม่พบคำเชิญ",
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION:
    "ผู้เชิญไม่ได้เป็นสมาชิกขององค์กรนี้แล้ว",
  LINKED_ACCOUNT_ALREADY_EXISTS: "มีบัญชีที่เชื่อมต่อไว้แล้ว",
  MEMBER_NOT_FOUND: "ไม่พบสมาชิก",
  METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED:
    "การใช้เมธอด POST ต้องเปิด deferSessionRefresh ในการตั้งค่าเซสชัน",
  MISSING_AC_INSTANCE:
    "การควบคุมสิทธิ์แบบไดนามิกต้องกำหนดอินสแตนซ์ ac ไว้ในปลั๊กอินฝั่งเซิร์ฟเวอร์ ดูรายละเอียดในล็อกของเซิร์ฟเวอร์",
  MISSING_FIELD: "กรุณากรอกข้อมูลให้ครบถ้วน",
  MISSING_OR_NULL_ORIGIN: "คำขอไม่มี Origin หรือ Origin เป็น null",
  NO_ACTIVE_ORGANIZATION: "ไม่มีองค์กรที่ใช้งานอยู่",
  NO_DATA_TO_UPDATE: "ไม่มีข้อมูลที่จะอัปเดต",
  ORGANIZATION_ALREADY_EXISTS: "มีองค์กรนี้อยู่แล้ว",
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "องค์กรมีสมาชิกครบจำนวนสูงสุดแล้ว",
  ORGANIZATION_NOT_FOUND: "ไม่พบองค์กร",
  ORGANIZATION_SLUG_ALREADY_TAKEN: "slug ขององค์กรนี้ถูกใช้แล้ว",
  ORIGIN_NOT_CONFIGURED:
    "ยังไม่ได้ตั้งค่า origin ของ Passkey กรุณากำหนดตัวเลือก origin ของปลั๊กอิน passkey หรือตั้งค่า baseURL",
  OTP_HAS_EXPIRED: "รหัส OTP หมดอายุแล้ว",
  OTP_NOT_CONFIGURED: "ไม่สามารถใช้ OTP ได้",
  OTP_NOT_ENABLED: "ยังไม่ได้เปิดใช้งาน OTP",
  PASSKEY_NOT_FOUND: "ไม่พบ Passkey",
  PASSWORD_ALREADY_SET: "ผู้ใช้ตั้งรหัสผ่านไว้แล้ว",
  PASSWORD_CANNOT_BE_UPDATED_VIA_UPDATE_USER:
    "ไม่สามารถเปลี่ยนรหัสผ่านผ่าน update-user ได้ กรุณาใช้ set-user-password แทน",
  PASSWORD_TOO_LONG: "รหัสผ่านยาวเกินไป",
  PASSWORD_TOO_SHORT: "รหัสผ่านสั้นเกินไป",
  POLLING_TOO_FREQUENTLY: "ตรวจสอบสถานะถี่เกินไป",
  PREVIOUSLY_REGISTERED: "ลงทะเบียน Passkey นี้ไว้แล้ว",
  PROVIDER_NOT_FOUND: "ไม่พบผู้ให้บริการ",
  REGISTRATION_CANCELLED: "ยกเลิกการลงทะเบียนแล้ว",
  RESOLVED_USER_INVALID: "ผู้ใช้ที่ resolveUser ส่งกลับมาไม่ถูกต้อง",
  RESOLVE_USER_REQUIRED:
    "การลงทะเบียน Passkey ต้องมีเซสชันที่เข้าสู่ระบบอยู่ หรือมี callback resolveUser เมื่อ requireSession เป็น false",
  ROLE_IS_ASSIGNED_TO_MEMBERS:
    "ไม่สามารถลบบทบาทที่สมาชิกใช้อยู่ได้ กรุณาเปลี่ยนบทบาทของสมาชิกเหล่านั้นก่อน",
  ROLE_NAME_IS_ALREADY_TAKEN: "ชื่อบทบาทนี้ถูกใช้แล้ว",
  ROLE_NOT_FOUND: "ไม่พบบทบาท",
  SESSION_EXPIRED: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการนี้",
  SESSION_NOT_FRESH: "เซสชันไม่ใหม่พอ กรุณาเข้าสู่ระบบอีกครั้ง",
  SESSION_REQUIRED: "ต้องเข้าสู่ระบบก่อนลงทะเบียน Passkey",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "บัญชีโซเชียลนี้ถูกเชื่อมต่อแล้ว",
  TEAM_ALREADY_EXISTS: "มีทีมนี้อยู่แล้ว",
  TEAM_MEMBER_LIMIT_REACHED: "ทีมมีสมาชิกครบจำนวนสูงสุดแล้ว",
  TEAM_NOT_FOUND: "ไม่พบทีม",
  TOKEN_EXPIRED: "โทเค็นหมดอายุ",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "พยายามหลายครั้งเกินไป กรุณาขอรหัสใหม่",
  TOO_MANY_ROLES: "องค์กรนี้มีบทบาทมากเกินไป",
  TOTP_ALREADY_ENABLED: "เปิดใช้งาน TOTP อยู่แล้ว",
  TOTP_NOT_CONFIGURED: "ไม่สามารถใช้ TOTP ได้",
  TOTP_NOT_ENABLED: "ยังไม่ได้เปิดใช้งาน TOTP",
  TWO_FACTOR_NOT_ENABLED: "ยังไม่ได้เปิดใช้งานการยืนยันตัวตนสองขั้นตอน",
  UNABLE_TO_CREATE_SESSION: "ไม่สามารถสร้างเซสชันได้",
  UNABLE_TO_REMOVE_LAST_TEAM: "ไม่สามารถลบทีมสุดท้ายได้",
  UNEXPECTED_ERROR: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
  UNKNOWN_ERROR: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
  USERNAME_IS_ALREADY_TAKEN: "ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น",
  USERNAME_IS_IMMUTABLE: "ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้",
  USERNAME_TOO_LONG: "ชื่อผู้ใช้ยาวเกินไป",
  USERNAME_TOO_SHORT: "ชื่อผู้ใช้สั้นเกินไป",
  USER_ALREADY_EXISTS: "มีผู้ใช้นี้อยู่แล้ว",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "มีผู้ใช้นี้อยู่แล้ว กรุณาใช้อีเมลอื่น",
  USER_ALREADY_HAS_PASSWORD: "ผู้ใช้มีรหัสผ่านอยู่แล้ว กรุณากรอกรหัสผ่านเพื่อลบบัญชี",
  USER_EMAIL_NOT_FOUND: "ไม่พบอีเมลผู้ใช้",
  USER_ID_CANNOT_BE_UPDATED: "ไม่สามารถเปลี่ยนรหัสผู้ใช้ได้",
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "ผู้ใช้เป็นสมาชิกขององค์กรนี้อยู่แล้ว",
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "ผู้ใช้ถูกเชิญเข้าองค์กรนี้แล้ว",
  USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: "ผู้ใช้ไม่ได้เป็นสมาชิกขององค์กร",
  USER_IS_NOT_A_MEMBER_OF_THE_TEAM: "ผู้ใช้ไม่ได้เป็นสมาชิกของทีม",
  USER_NOT_FOUND: "ไม่พบผู้ใช้",
  VALIDATION_ERROR: "ข้อมูลไม่ถูกต้อง",
  VERIFICATION_EMAIL_NOT_ENABLED: "ยังไม่ได้เปิดใช้งานอีเมลยืนยัน",
  YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION:
    "คุณไม่มีสิทธิ์เข้าถึงองค์กรนี้ในฐานะเจ้าของ",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "คุณไม่มีสิทธิ์แบนผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "คุณไม่มีสิทธิ์ยกเลิกคำเชิญนี้",
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "คุณไม่มีสิทธิ์เปลี่ยนบทบาทของผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: "คุณไม่มีสิทธิ์สร้างองค์กรใหม่",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: "คุณไม่มีสิทธิ์สร้างทีมใหม่",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER: "คุณไม่มีสิทธิ์เพิ่มสมาชิกใหม่",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE: "คุณไม่มีสิทธิ์สร้างบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION:
    "คุณไม่มีสิทธิ์สร้างทีมในองค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: "คุณไม่มีสิทธิ์สร้างผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE: "คุณไม่มีสิทธิ์ลบบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION:
    "คุณไม่มีสิทธิ์ลบทีมในองค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "คุณไม่มีสิทธิ์ลบสมาชิกนี้",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: "คุณไม่มีสิทธิ์ลบองค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: "คุณไม่มีสิทธิ์ลบทีมนี้",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "คุณไม่มีสิทธิ์ลบผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE: "คุณไม่มีสิทธิ์ดึงข้อมูลบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_GET_USER: "คุณไม่มีสิทธิ์ดูข้อมูลผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: "คุณไม่มีสิทธิ์แอบอ้างเป็นผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
    "คุณไม่มีสิทธิ์เชิญผู้ใช้เข้าองค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: "คุณไม่มีสิทธิ์เชิญผู้ใช้ในบทบาทนี้",
  YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE: "คุณไม่มีสิทธิ์ดูรายการบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_LIST_INVITATIONS: "คุณไม่มีสิทธิ์ดูรายการคำเชิญขององค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "คุณไม่มีสิทธิ์ดูรายชื่อผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: "คุณไม่มีสิทธิ์ดูเซสชันของผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE: "คุณไม่มีสิทธิ์ดูบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: "คุณไม่มีสิทธิ์ลงทะเบียน Passkey นี้",
  YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER: "คุณไม่มีสิทธิ์นำสมาชิกออกจากทีม",
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: "คุณไม่มีสิทธิ์เพิกถอนเซสชันของผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_SET_NON_EXISTENT_VALUE: "คุณไม่สามารถกำหนดบทบาทที่ไม่มีอยู่ได้",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_EMAIL: "คุณไม่มีสิทธิ์แก้ไขอีเมลของผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: "คุณไม่มีสิทธิ์ตั้งรหัสผ่านให้ผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PHONE_NUMBER: "คุณไม่มีสิทธิ์แก้ไขเบอร์โทรศัพท์ของผู้ใช้",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE: "คุณไม่มีสิทธิ์แก้ไขบทบาท",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "คุณไม่มีสิทธิ์แก้ไขข้อมูลสมาชิกนี้",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: "คุณไม่มีสิทธิ์แก้ไของค์กรนี้",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: "คุณไม่มีสิทธิ์แก้ไขทีมนี้",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS: "คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้",
  YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: "คุณไม่ได้เป็นสมาชิกขององค์กรนี้",
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: "คุณไม่ใช่ผู้รับคำเชิญนี้",
  YOU_CANNOT_BAN_YOURSELF: "คุณไม่สามารถแบนตัวเองได้",
  YOU_CANNOT_IMPERSONATE_ADMINS: "คุณไม่สามารถแอบอ้างเป็นผู้ดูแลได้",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
    "คุณไม่สามารถออกจากองค์กรได้เนื่องจากเป็นเจ้าของเพียงคนเดียว",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER:
    "คุณไม่สามารถออกจากองค์กรได้ เพราะองค์กรจะไม่มีเจ้าของเหลืออยู่",
  YOU_CANNOT_REMOVE_YOURSELF: "คุณไม่สามารถลบตัวเองได้",
  YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM: "คุณไม่มีสิทธิ์ดูรายชื่อสมาชิกของทีมนี้",
  YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM: "คุณไม่มีทีมที่ใช้งานอยู่",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS:
    "คุณมีองค์กรครบจำนวนสูงสุดแล้ว",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: "คุณมีทีมครบจำนวนสูงสุดแล้ว",
  YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE:
    "คุณต้องอยู่ในองค์กรจึงจะสร้างบทบาทได้",
};

/**
 * Codes the configured plugins throw without listing them in
 * `$ERROR_CODES`, read from the better-auth 1.7.25 sources: account linking
 * and token refresh in core, organization, twoFactor, sso (SAML, domain
 * verification, OIDC discovery) and scim. oauthProvider answers with OAuth
 * `error` fields instead of codes; jwt, expo, lastLoginMethod, bearer,
 * oAuthProxy, oneTap, openAPI and customSession throw no coded errors.
 */
export const otherCodeTranslations: Record<string, string> = {
  ACCESS_TOKEN_NOT_FOUND: "ไม่พบโทเค็นการเข้าถึง",
  CERT_SOURCE_MISSING:
    "samlConfig ต้องมีใบรับรองสำหรับลงนาม (cert หรือ idpMetadata.cert) หรือเอกสาร XML ใน idpMetadata.metadata",
  DOMAIN_VERIFICATION_FAILED: "ยืนยันความเป็นเจ้าของโดเมนไม่สำเร็จ กรุณาลองใหม่ภายหลัง",
  DOMAIN_VERIFIED: "ยืนยันโดเมนนี้แล้ว",
  EMAIL_PASSWORD_DISABLED: "ไม่ได้เปิดใช้การเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน",
  EMAIL_PASSWORD_SIGN_UP_DISABLED: "ไม่ได้เปิดให้สมัครสมาชิกด้วยอีเมลและรหัสผ่าน",
  FAILED_TO_GET_ACCESS_TOKEN: "ไม่สามารถรับโทเค็นการเข้าถึงที่ใช้งานได้",
  FAILED_TO_INVALIDATE_TWO_FACTOR_CHALLENGE: "ยกเลิกคำขอยืนยันตัวตนสองขั้นตอนไม่สำเร็จ",
  FAILED_TO_REFRESH_ACCESS_TOKEN: "ต่ออายุโทเค็นการเข้าถึงไม่สำเร็จ",
  IDENTIFIER_TOO_LONG: "ตัวระบุสำหรับยืนยันโดเมนยาวเกินขีดจำกัดของ DNS label",
  IDP_SLO_NOT_SUPPORTED: "IdP ไม่รองรับ Single Logout",
  INTERNAL_SERVER_ERROR: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
  INVALID_DOMAIN: "โดเมนไม่ถูกต้อง",
  INVALID_LOGOUT_REQUEST: "LogoutRequest ไม่ถูกต้อง",
  INVALID_LOGOUT_RESPONSE: "LogoutResponse ไม่ถูกต้อง",
  LINKING_DIFFERENT_EMAILS_NOT_ALLOWED:
    "ไม่ได้เชื่อมต่อบัญชี เพราะไม่อนุญาตให้เชื่อมบัญชีที่ใช้อีเมลต่างกัน",
  LINKING_FAILED: "ไม่ได้เชื่อมต่อบัญชี เพราะสร้างบัญชีไม่สำเร็จ",
  LINKING_NOT_ALLOWED: "ไม่ได้เชื่อมต่อบัญชี เพราะไม่อนุญาตให้เชื่อมบัญชีนี้",
  LOGOUT_FAILED_AT_IDP: "ออกจากระบบที่ IdP ไม่สำเร็จ",
  NOT_FOUND: "ไม่พบข้อมูล",
  NO_PENDING_VERIFICATION: "ไม่มีการยืนยันโดเมนที่รอดำเนินการ",
  OAUTH_LINK_ERROR: "เชื่อมต่อบัญชีผ่าน OAuth ไม่สำเร็จ",
  ORGANIZATION_DELETION_DISABLED: "ไม่ได้เปิดให้ลบองค์กร",
  PROVIDER_NOT_CONFIGURED: "บัญชีนี้ไม่ได้เชื่อมกับผู้ให้บริการโซเชียลที่ตั้งค่าไว้",
  PROVIDER_NOT_SUPPORTED: "ไม่รองรับผู้ให้บริการนี้",
  REFRESH_TOKEN_NOT_FOUND: "ไม่พบ refresh token",
  RESET_PASSWORD_DISABLED: "ไม่ได้เปิดใช้การรีเซ็ตรหัสผ่าน",
  SAML_ALGORITHM_NOT_ALLOWED: "อัลกอริทึม SAML นี้ไม่อยู่ในรายการที่อนุญาต",
  SAML_ASSERTION_MISSING: "SAML response ไม่มี assertion",
  SAML_ASSERTION_SIGNATURE_REQUIRED: "SAML assertion ต้องมีลายเซ็น",
  SAML_AUDIENCE_MISMATCH:
    "audience ของ SAML assertion ไม่ตรงกับ Service Provider นี้",
  SAML_AUDIENCE_MISSING: "SAML assertion ไม่มี AudienceRestriction",
  SAML_BEARER_CONFIRMATION_MISSING:
    "SAML assertion ไม่มี SubjectConfirmationData แบบ bearer",
  SAML_DESTINATION_MISMATCH:
    "Destination ของ SAML response ไม่ตรงกับ Service Provider นี้",
  SAML_INVALID_ENCODING: "SAML response เข้ารหัส base64 ไม่ถูกต้อง",
  SAML_INVALID_SP_METADATA: "metadata ของ SAML Service Provider ไม่ถูกต้อง",
  SAML_INVALID_XML: "อ่าน XML ของ SAML response ไม่สำเร็จ",
  SAML_MULTIPLE_ASSERTIONS: "SAML response ต้องมี assertion เพียงรายการเดียว",
  SAML_NO_ASSERTION: "SAML response ไม่มี assertion",
  SAML_PROVIDER_NOT_FOUND: "ไม่พบผู้ให้บริการ SAML",
  SAML_RECIPIENT_MISMATCH:
    "Recipient ใน SubjectConfirmationData ของ SAML ไม่ตรงกับ Service Provider นี้",
  SAML_RECIPIENT_MISSING: "SubjectConfirmationData ของ SAML ไม่มี Recipient",
  SAML_RESPONSE_INVALID_XML: "อ่าน XML ของ SAML response ไม่สำเร็จ",
  SAML_SP_METADATA_ASSERTION_SIGNATURE_MISMATCH:
    "metadata ของ SAML Service Provider ต้องกำหนดให้ assertion มีลายเซ็น",
  SAML_UNKNOWN_ALGORITHM: "ไม่รู้จักอัลกอริทึม SAML นี้",
  SCIM_MANAGED_CREATION_REQUEST_ID_CONFLICT:
    "มีคำขอสร้างการเชื่อมต่อ SCIM ที่ใช้รหัสคำขอนี้อยู่แล้ว",
  SCIM_REQUIRES_NATIVE_TRANSACTIONS: "ปลั๊กอิน SCIM ต้องใช้ฐานข้อมูลที่รองรับทรานแซกชัน",
  SINGLE_LOGOUT_NOT_ENABLED: "ไม่ได้เปิดใช้ Single Logout",
  SSO_PROVIDER_CHANGED:
    "ผู้ให้บริการ SSO เปลี่ยนไประหว่างดำเนินการ กรุณาโหลดข้อมูลใหม่แล้วลองอีกครั้ง",
  SSO_PROVIDER_MUTATION_GUARD_REQUIRES_ASYNC_CONTEXT:
    "การป้องกันการแก้ไขผู้ให้บริการ SSO ต้องใช้ฐานข้อมูลที่รองรับ async context ของทรานแซกชัน",
  SSO_PROVIDER_MUTATION_GUARD_REQUIRES_NATIVE_TRANSACTIONS:
    "การป้องกันการแก้ไขผู้ให้บริการ SSO ต้องใช้ฐานข้อมูลที่รองรับทรานแซกชัน",
  SSO_PROVIDER_MUTATION_REJECTED: "ไม่อนุญาตให้แก้ไขผู้ให้บริการ SSO",
  SSO_USER_RESOLUTION_FAILED: "ไม่สามารถระบุผู้ใช้จาก SSO ได้",
  SSO_USER_RESOLUTION_REQUIRES_ASYNC_CONTEXT:
    "การระบุผู้ใช้จาก SSO ต้องใช้ฐานข้อมูลที่รองรับ async context ของทรานแซกชัน",
  SSO_USER_RESOLUTION_REQUIRES_DATABASE_SESSIONS:
    "การระบุผู้ใช้จาก SSO ต้องเก็บเซสชันไว้ในฐานข้อมูล",
  SSO_USER_RESOLUTION_REQUIRES_NATIVE_TRANSACTIONS:
    "การระบุผู้ใช้จาก SSO ต้องใช้ฐานข้อมูลที่รองรับทรานแซกชัน",
  TOKEN_REFRESH_NOT_SUPPORTED: "ผู้ให้บริการนี้ไม่รองรับการต่ออายุโทเค็น",
  UNAUTHORIZED: "ไม่ได้รับอนุญาต",
  USER_ID_OR_SESSION_REQUIRED: "ต้องระบุ userId หรือมีเซสชัน",
  account_hook_binding_conflict: "hook ของบัญชีเปลี่ยนการผูกบัญชีที่เลือกไว้",
  account_ownership_conflict: "บัญชีนี้เชื่อมต่อกับผู้ใช้อื่นอยู่แล้ว",
  discovery_incomplete: "เอกสาร OIDC discovery ขาดข้อมูลที่จำเป็น",
  discovery_invalid_json: "OIDC discovery ส่งข้อมูลที่ไม่ถูกต้องกลับมา",
  discovery_invalid_url: "URL ของ endpoint OIDC ไม่ถูกต้อง",
  discovery_not_found:
    "ไม่พบ endpoint ของ OIDC discovery ผู้ออกโทเค็นอาจไม่รองรับ OIDC discovery หรือ URL ไม่ถูกต้อง",
  discovery_private_host: "URL ของ endpoint OIDC ชี้ไปยังโฮสต์ที่ไม่ใช่สาธารณะ",
  discovery_timeout: "OIDC discovery หมดเวลา",
  discovery_unexpected_error: "OIDC discovery ล้มเหลวโดยไม่ทราบสาเหตุ",
  discovery_untrusted_origin:
    "URL ของ OIDC discovery ไม่อยู่ในรายการ origin ที่เชื่อถือ",
  issuer_mismatch: "issuer ของ OIDC ไม่ตรงกัน",
  oidc_endpoint_redirect: "endpoint ของ OIDC ตอบกลับด้วยการเปลี่ยนเส้นทาง ซึ่งไม่อนุญาต",
  session_hook_user_conflict: "hook ของเซสชันเปลี่ยนผู้ใช้ที่เลือกไว้",
  unsupported_token_auth_method:
    "ผู้ให้บริการ OIDC ใช้วิธียืนยันตัวตนที่ endpoint โทเค็นซึ่งระบบไม่รองรับ",
  user_hook_selection_conflict: "hook ของผู้ใช้เปลี่ยนผู้ใช้ที่เลือกไว้",
  user_not_found: "ไม่พบผู้ใช้",
  validation_context_missing: "การตรวจสอบผู้ใช้ต้องทำภายในบริบทของ endpoint",
  validation_failed: "ตรวจสอบข้อมูลผู้ใช้ไม่ผ่าน",
  validation_source_missing: "ต้องระบุแหล่งที่มาสำหรับตรวจสอบผู้ใช้",
};

export const translations = {
  th: { ...errorCodeTranslations, ...otherCodeTranslations },
};
