import PocketBase from 'pocketbase'

export const pb = new PocketBase('https://pb3.jorgeadolfo.com')
pb.autoCancellation(false)
