export enum MessageContentType {
  ping = 'ping',
  receipt = 'receipt',
  read = 'read',
  text = 'text',
  textExtension = 'textExtension',
  ipfs = 'ipfs',
  image = 'image',
  audio = 'audio',
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
  Error = 0,
  Success = 1 << 0,
  Receipt = 1 << 1,
  Read = 1 << 2
}
