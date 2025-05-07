import { createNotivue } from 'notivue'


import 'notivue/notification.css' // Only needed if using built-in <Notification />
import 'notivue/animations.css' // Only needed if using default animations

export const notivue = createNotivue({
  position: 'bottom-center',
})
