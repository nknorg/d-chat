export enum MessageContentType {
  ping = 'ping',
  receipt = 'receipt',
  read = 'read',
  text = 'text',
  textExtension = 'textExtension',
  ipfs = 'ipfs',
  image = 'image',
  audio = 'audio',
  video = 'video',
  file = 'file',
  piece = 'piece',

  topicSubscribe = 'event:subscribe',
  topicUnsubscribe = 'event:unsubscribe',
  topicInvitation = 'event:channelInvitation',

  privateGroupInvitation = 'privateGroup:invitation',
  privateGroupSubscribe = 'privateGroup:subscribe',
  privateGroupAccept = 'privateGroup:accept',
  privateGroupQuit = 'privateGroup:quit',
  privateGroupOptionRequest = 'privateGroup:optionRequest',
  privateGroupOptionResponse = 'privateGroup:optionResponse',
  privateGroupMemberRequest = 'privateGroup:memberRequest',
  privateGroupMemberResponse = 'privateGroup:memberResponse',

  contactProfile = 'contact:profile',
  contactOptions = 'contact:options',
  deviceRequest = 'device:request',
  deviceInfo = 'device:info'
}

export enum MessageStatus {
  Sending = 0,
  Error = 1,
  Sent = 1 << 1,
  Receipt = 1 << 2,
  Read = 1 << 3
}

export enum PayloadType {
  BINARY = 0,
  TEXT = 1,
  ACK = 2,
  SESSION = 3
}
