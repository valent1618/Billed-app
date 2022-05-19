# Billed

## Description

Saas for HR. Ability to log in as an employee, or as an HR administrator.
Employees can add expense reports and administrator can manage them.

## Architecture
This project is connected to an API backend service who you must run locally.

API backend service : https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

### Demo

## Getting Started

### Installing

*You can remove -g from command line to install dependencies locally and not globally*

#### Backend
**Clone repo**
```
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

**And install dependencies**
```
npm install
```

#### Frontend
**Clone repo**
```
git clone https://github.com/valent1618/Billed-app
```

**And install live-server**
```
npm install -g live-server
```

### Run

#### Backend
```
npm run:dev
```

**Acces to the API**
The API is locally available on port 5678, go to http://localhost:5678

#### Frontend
```
live-server
```

### Account
#### Administrator
```
user : admin@company.tld
password : admin
```

#### Employee
```
user : employee@company.tld
password : employee
```
