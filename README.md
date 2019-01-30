## Production Deployment on Ubuntu 18.04
### Step 01: Install Node.js
```
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install nodejs -y
```

### Step 02: Create project folder, and clone project code from Github
```
mkdir webex-web
cd webex-web
npm i 
sudo npm i -g nodemon
npm start
```
Now you can goto <server_addr>:3000 and you should be able to see login screen

### Step 03.  install PM2, which is a process manager for Node.js applications(run them in the background as a service)
```
sudo npm install -g pm2

```

### Step 04: Manage Application with PM2
In your project folder, run
```
pm2 start app.js
```

get your application run at server startup
```
pm2 startup systemd
```
The last line of the resulting output will include a command that you must run with superuser privileges:
```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Now stop the process
```
pm2 stop app
pm2 delete app
```

### Step 05: Run Node.js app with process.yml
goto your project folder
```
pm2 start process.yml
```
use below code to check if it is activated. If not (dead), run `sudo reboot` to restart the server
```
systemctl status pm2-ubuntu
``` 
Now you can goto <server_addr>:3000 and you should be able to see login screen

Some useful pm2 sub-command
```
pm2 status
pm2 restart <id>
pm2 stop <id>
pm2 show <id> // check details
pm2 logs <name> [--lines 1000] // check logs
```

### Step 06: Install nginx, if it is not installed
```
sudo apt install nginx
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
systemctl status nginx // check staus
```
Now if you go to <server_addr>, you should see the nginx welcome page

### Step 07: use nginx as Reverse Proxy Server, forward clients request to our node.js application, which is listening on port 3000
Open /etc/nginx/sites-available/default
```
sudo vim /etc/nginx/sites-available/default
```

DON'T touch other part, but replace the whole `location` section with below code
```
. . .
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then restart nginx
```
sudo nginx -t
sudo systemctl restart nginx
```

## Get Started:
```
npm i 
npm i -g nodemon
npm start
```