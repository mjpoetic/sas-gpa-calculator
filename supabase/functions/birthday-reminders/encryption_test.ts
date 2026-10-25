import webpush from 'npm:web-push@3.6.7';
import {createECDH,randomBytes} from 'node:crypto';
Deno.test('runtime generates encrypted VAPID push requests without contacting a provider',()=>{
 const keys=webpush.generateVAPIDKeys(),ecdh=createECDH('prime256v1');ecdh.generateKeys();
 const subscription={endpoint:'https://fcm.googleapis.com/synthetic-test',keys:{p256dh:ecdh.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
 const details=webpush.generateRequestDetails(subscription,JSON.stringify({body:'You have 1 student to celebrate today.'}),{vapidDetails:{subject:'https://github.com/mjpoetic/sas-gpa-calculator',publicKey:keys.publicKey,privateKey:keys.privateKey}});
 if(!details.body?.length||!details.headers.Authorization?.startsWith('vapid '))throw new Error('Encrypted push request not generated');
 if(details.body.toString().includes('student'))throw new Error('Notification payload was not encrypted');
});
