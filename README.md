# Application Web Usage Guide

## 1. Deleting the Auth Info Folder

If you want to re-link WhatsApp, you need to delete the **auth info** folder first. Follow these steps:

1. Locate the **auth info** folder in your application directory.
2. Delete all contents of that folder.
3. Restart your application to apply the changes.

## 2. Running the Application Using PM2

To run your Node.js application using **PM2**, follow these steps:

1. Make sure PM2 is installed using the following command:

   ```
   npm install pm2 -g
   ```

2. Start your application using the command:

   ```
   npx pm2 start app.js --name my-app
   ```

3. To see the list of running applications:

   ```
   npx pm2 list
   ```

4. To stop the application:

   ```
   npx pm2 stop my-app
   ```

5. To restart the application:

   ```
   npx pm2 restart my-app
   ```

6. To remove the application from the PM2 list:

   ```
   npx pm2 delete my-app
   ```

## 3. Running Ngrok

To run Ngrok and create a tunnel to your application, use the following command:

```
ngrok http 192.168.92.4:3021 --hostname=viable-learning-shrimp.ngrok-free.app
```

Ensure that Ngrok is installed and authenticated with your account. The above command will create a tunnel to your application on port **3021** with the address **viable-learning-shrimp.ngrok-free.app**.

Enjoy using your application! If you encounter any issues or have further questions, feel free to contact the developer.
