// ============================================
// turbo Monorepo Jenkins Pipeline
// ============================================
// Define all services in the Hospital24 monorepo
def SERVICES = [
    [name: 'turbo-nextjs', path: 'apps/nextjs', dockerfile: 'docker/Dockerfile.nextjs'],
    [name: 'turbo-expressjs', path: 'apps/expressjs', dockerfile: 'docker/Dockerfile.expressjs']
]

// ============================================
// Helper Functions
// ============================================
def getHealthCheckUrl(String serviceName) {
    switch(env.BRANCH_NAME) {
        case 'production':
            return env.PROD_API_URL
        case 'dev':
            return env.SIT_API_URL
        case 'uat':
            return env.UAT_API_URL
        default:
            return env.UAT_API_URL
    }
}

def getEnvCredentialId() {
    switch(env.BRANCH_NAME) {
        case 'production':
            return env.PROD_ENV_CREDENTIALS_ID
        case 'uat':
            return env.UAT_ENV_CREDENTIALS_ID
        case 'dev':
            return env.SIT_ENV_CREDENTIALS_ID
        default:
            return env.UAT_ENV_CREDENTIALS_ID
    }
}

def getImageName(String serviceName) {
    switch(env.BRANCH_NAME) {
        case 'production':
            return "${serviceName}-production"
        case 'uat':
            return "${serviceName}-uat"
        case 'dev':
            return "${serviceName}-sit"
        default:
            return "${serviceName}-uat"
    }
}

// ============================================
// Build Service Function
// ============================================
def buildService(serviceName, servicePath, dockerfile, imageTag) {
    def imageName = getImageName(serviceName)
    def fullImage = "${REGISTRY_URL}/${REGISTRY_PROJECT}/${imageName}:${imageTag}"
    
    try {        
        sh """
            echo "[BUILD] Building ${serviceName}..."
            docker build \
                -f ${dockerfile} \
                -t ${fullImage} \
                -t ${REGISTRY_URL}/${REGISTRY_PROJECT}/${imageName}:latest \
                . 2>&1
        """
      
        // Push to registry
        docker.withRegistry("https://${REGISTRY_URL}", REGISTRY_CREDENTIALS_ID) {
            sh """
                docker push ${fullImage}
                docker push ${REGISTRY_URL}/${REGISTRY_PROJECT}/${imageName}:latest
            """
        }
             
        // Clean up local images
        sh """
            docker rmi ${fullImage} || true
            docker rmi ${REGISTRY_URL}/${REGISTRY_PROJECT}/${imageName}:latest || true
        """
        
        return fullImage
        
    } catch (Exception e) {
        throw e
    }
}



// ============================================
// Trivy Security Scan
// ============================================
def scanImage(String fullImage) {
    try {
        sh """
            mkdir -p trivy-report
            trivy image --exit-code 0 --severity CRITICAL,HIGH \
                --format json -o trivy-report/report-${fullImage.replaceAll('/', '-').replaceAll(':', '-')}.json ${fullImage}
        """
        
        def reportFile = "trivy-report/report-${fullImage.replaceAll('/', '-').replaceAll(':', '-')}.json"
        def reportExists = sh(script: "test -f ${reportFile}", returnStatus: true) == 0
        
        if (reportExists) {
            def critical = sh(script: """
                jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' ${reportFile} 2>/dev/null || echo "0"
            """, returnStdout: true).trim()
            
            if (critical != "0") {
                def criticalVulns = sh(script: """
                    jq -r '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | "• **" + .VulnerabilityID + "**: " + .Title + " (Package: " + .PkgName + ")"' ${reportFile} 2>/dev/null
                """, returnStdout: true).trim()
            
            }
        }
    } catch (Exception e) {
        echo "⚠️ Trivy scan failed: ${e.getMessage()}"
    }
}

// ============================================
// Pipeline Definition
// ============================================
pipeline {
    agent any
    
    environment {
        // ============================================
        // CONFIGURATION - ปรับค่าตรงนี้ได้เลย
        // ============================================
        
        // Docker Registry
        REGISTRY_URL = 'registry.telecorpthailand.com'
        REGISTRY_PROJECT = 'turbo'
        REGISTRY_CREDENTIALS_ID = '667'  // ← เปลี่ยนเป็น credential ID
        
        // Git Configuration
        GIT_URL = 'https://gitea.telecorpthailand.com/phanuwat.lua/create-t3-turbo.git'  // ← เปลี่ยนเป็น repo ของคุณ
        GIT_CREDENTIALS_ID = '55'  // ← เปลี่ยนเป็น credential ID
        
        // Branch Configuration
        PRODUCTION_BRANCH = 'production'
        ALLOWED_BRANCHES = 'production,dev,uat,orpc'
        
        // Environment Credentials (ตั้งค่าใน Jenkins → Credentials → Secret file)
        UAT_ENV_CREDENTIALS_ID = 'turbo-env-uat'
        SIT_ENV_CREDENTIALS_ID = 'turbo-env-sit'
        PROD_ENV_CREDENTIALS_ID = 'turbo-env-prod'
             
        // Discord Colors
        COLOR_BLUE = '3447003'
        COLOR_PURPLE = '10181046'
        COLOR_GREEN = '15105570'
        COLOR_ORANGE = '15844367'
        COLOR_RED = '16753920'
        COLOR_GRAY = '16497928'
        COLOR_DARK_RED = '15158332'
        COLOR_GREEN_SUCCESS = '5763719'
        COLOR_BLUE_INFO = '8311585'
        COLOR_GRAY_INFO = '12745742'
        COLOR_GREEN_SUCCESS_FINAL = '3066993'
        
        // Health Check Configuration
        MAX_HEALTH_CHECK_ATTEMPTS = '30'
        HEALTH_CHECK_DELAY_SECONDS = '30'
        
        // Environment URLs (ปรับตาม environment ของคุณ)
        UAT_API_URL = 'https://demo.turbo.com/api/rest/health'
        PROD_API_URL = 'https://demo.turbo.com/api/rest/health'
        SIT_API_URL = 'https://demo.turbo.com/api/rest/health'
    }
    
    stages {
        
        stage('Checkout') {
            steps {
                script {
                    echo "🔀 Checking out branch: ${env.BRANCH_NAME}"
                    git url: env.GIT_URL, branch: env.BRANCH_NAME, credentialsId: env.GIT_CREDENTIALS_ID
                    
                    if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
                   } else {
                        echo "🛑 Branch ${env.BRANCH_NAME} is not allowed"
                        currentBuild.result = 'NOT_BUILT'
                        error("Branch ${env.BRANCH_NAME} is not allowed")
                    }

                    env.IMAGE_NAME = getImageName(env.REGISTRY_PROJECT)
                }
            }
        }
        
        stage('Inject .env for Next.js') {
            steps {
                withCredentials([file(credentialsId: getEnvCredentialId(), variable: 'ENV_FILE')]) {
                    sh "chmod -R u+w . && cp ${ENV_FILE} ."
                }
            }
        }
        
        stage('Detect Changed Services') {
            steps {
                script {
                    def changed = []
                    try {
                        changed = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim().split("\n")
                    } catch (Exception e) {
                        echo "⚠️ Could not get diff, building all services..."
                        env.CHANGED_SERVICES = SERVICES.collect { "${it.name}:${it.path}:${it.dockerfile}" }.join(',')
                        return
                    }
                    
                    def changedServices = []
                    SERVICES.each { service ->
                        def hasChanges = changed.any { file ->
                            file.startsWith("${service.path}/") ||
                            file.startsWith("${service.dockerfile}") ||
                            file.startsWith("packages/") ||
                            file.startsWith("tooling/") ||
                            file == "package.json" ||
                            file == "pnpm-lock.yaml" ||
                            file == "turbo.json"
                        }
                        
                        if (hasChanges) {
                            changedServices.add(service)
                            echo "✅ Detected changes in: ${service.name}"
                        }
                    }
                    
                    if (changedServices.isEmpty()) {
                        echo "⏩ No changes detected. Skipping build."
                        currentBuild.result = 'SUCCESS'
                        return
                    }
                    
                    env.CHANGED_SERVICES = changedServices.collect { "${it.name}:${it.path}:${it.dockerfile}" }.join(',')
                    def serviceNames = changedServices.collect { it.name }.join(', ')
                    echo "🎯 Services to build: ${serviceNames}"
                
                }
            }
        }
        
        stage('Generate Image Tag') {
            steps {
                script {
                    def shortSha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${shortSha}"
                    env.FULL_IMAGE = "${env.REGISTRY_URL}/${env.REGISTRY_PROJECT}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                    
                    echo "[TAG] Image tag: ${env.IMAGE_TAG}"
                    
   
                }
            }
        }

        stage('Build & Push Services') {
            when {
                expression { env.CHANGED_SERVICES != null }
            }
            steps {
                script {
                    def servicesToBuild = env.CHANGED_SERVICES.split(',')
                    def builtImages = [:]
                    
                    servicesToBuild.each { serviceInfo ->
                        def parts = serviceInfo.split(':')
                        def serviceName = parts[0]
                        def servicePath = parts[1]
                        def dockerfile = parts[2]
                        
                        echo "[BUILD] Building ${serviceName}..."
                        def fullImage = buildService(serviceName, servicePath, dockerfile, env.IMAGE_TAG)
                        builtImages[serviceName] = fullImage
                    }
                    
                    env.BUILT_IMAGES = builtImages.collect { "${it.key}=${it.value}" }.join(',')
                    

                }
            }
        }
        
        // stage('Build Docker Image') {
        //     steps {
        //         wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
        //             sh '''
        //                 echo "[BUILD] Building image..." 
        //                 DOCKER_BUILDKIT=1 docker build -t ${FULL_IMAGE} . 2>&1 
        //             '''
        //             script {
        //                 sendDiscordEmbed('🔨 Docker Build', "Building image `${FULL_IMAGE}`", 16753920)
        //             }
        //         }
        //     }
        // }

        // stage('Push to Harbor') {
        //     steps {
        //         wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
        //             script {
        //                 docker.withRegistry("https://${REGISTRY_URL}", REGISTRY_CREDENTIALS_ID) {
        //                     sh '''
        //                         echo "[PUSH] Pushing image to Harbor..." 
        //                         docker push ${FULL_IMAGE} 2>&1 
        //                         docker tag ${FULL_IMAGE} ${REGISTRY_URL}/${REGISTRY_PROJECT}/${IMAGE_NAME}:latest
        //                         docker push ${REGISTRY_URL}/${REGISTRY_PROJECT}/${IMAGE_NAME}:latest 2>&1 
        //                     '''
        //                 }
        //                 sendDiscordEmbed('🚢 Image Pushed', "**Image:** `${FULL_IMAGE}`", 8311585)
        //             }
        //         }
        //     }
        // }
        
        stage('Security Scan with Trivy') {
            when {
                expression { env.CHANGED_SERVICES != null }
            }
            steps {
                script {

                    
                    def builtImages = env.BUILT_IMAGES.split(',')
                    builtImages.each { imageInfo ->
                        def fullImage = imageInfo.split('=')[1]
                        scanImage(fullImage)
                    }
                    

                }
            }
        }
        
        // stage('Wait for Confirm Deploy') {
        //     when {
        //         not { branch 'dev' }
        //         expression { env.CHANGED_SERVICES != null }
        //     }
        //     steps {
        //         script {
        //             if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
        //                 def serviceNames = env.CHANGED_SERVICES.split(',').collect { it.split(':')[0] }.join(', ')
        //                 sendDiscordEmbed("📦 Images Ready for Deploy", 
        //                     "**Services:** ${serviceNames}\\n**Tag:** `${IMAGE_TAG}`\\n**Environment:** `${BRANCH_NAME}`\\n**Action Required:** Please deploy manually", 
        //                     env.COLOR_BLUE.toInteger())
        //             }
                    
        //             def userInput = input(
        //                 id: 'ConfirmDeploy',
        //                 message: "🚀 MANUAL DEPLOYMENT REQUIRED\n\nTag: ${IMAGE_TAG}\nEnvironment: ${BRANCH_NAME}\n\n✅ Click OK when deployment is complete.",
        //                 parameters: [
        //                     booleanParam(
        //                         name: 'readyForHealthCheck',
        //                         defaultValue: false,
        //                         description: '✅ Check when deployment is complete'
        //                     )
        //                 ]
        //             )
                    
        //             if (!userInput) {
        //                 error("Deployment cancelled")
        //             }
                    
        //             if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
        //                 sendDiscordEmbed("✅ Deploy Confirmed", "Starting health check...", env.COLOR_GREEN_SUCCESS.toInteger())
        //             }
        //         }
        //     }
        // }
        
        // stage('Health Check') {
        //     when {
        //         expression { env.CHANGED_SERVICES != null }
        //     }
        //     steps {
        //         script {
        //             def maxAttempts = env.MAX_HEALTH_CHECK_ATTEMPTS.toInteger()
        //             def attempt = 1
        //             def success = false
        //             def targetUrl = getHealthCheckUrl('turbo')
                    
        //             if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
        //                 sendDiscordEmbed("🚀 Health Check Start", 
        //                     "**Expected Tag:** `${IMAGE_TAG}`\\n**Max Attempts:** ${maxAttempts}", 
        //                     env.COLOR_BLUE.toInteger())
        //             }
                    
        //             while (attempt <= maxAttempts && !success) {
        //                 echo "[HEALTH_CHECK] Attempt ${attempt}/${maxAttempts}"
                        
        //                 try {
        //                     def response = sh(script: "curl -s -f '${targetUrl}'", returnStdout: true).trim()
        //                     echo "[HEALTH_CHECK] Response: ${response}"
                            
        //                     // Check if response contains the tag (adjust based on your API response format)
        //                     if (response.contains(env.IMAGE_TAG)) {
        //                         success = true
        //                         echo "[HEALTH_CHECK] ✅ SUCCESS: Tag matches!"
                                
        //                         if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
        //                             sendDiscordEmbed("✅ Deployment Success", 
        //                                 "**Tag:** `${IMAGE_TAG}`\\n**Attempts:** ${attempt}/${maxAttempts}", 
        //                                 env.COLOR_GREEN_SUCCESS_FINAL.toInteger())
        //                         }
        //                     } else {
        //                         echo "[HEALTH_CHECK] ❌ Tag mismatch"
        //                         if (attempt < maxAttempts) {
        //                             sleep(env.HEALTH_CHECK_DELAY_SECONDS.toInteger())
        //                         }
        //                     }
        //                 } catch (Exception e) {
        //                     echo "[HEALTH_CHECK] ❌ Error: ${e.getMessage()}"
        //                     if (attempt < maxAttempts) {
        //                         sleep(env.HEALTH_CHECK_DELAY_SECONDS.toInteger())
        //                     }
        //                 }
                        
        //                 attempt++
        //             }
                    
        //             if (!success) {
        //                 if (env.ALLOWED_BRANCHES.split(',').contains(env.BRANCH_NAME)) {
        //                     sendDiscordEmbed("❌ Health Check Failed", 
        //                         "**Tag:** `${IMAGE_TAG}`\\n**Reason:** Failed after ${maxAttempts} attempts", 
        //                         env.COLOR_DARK_RED.toInteger())
        //                 }
        //                 error("Health check failed after ${maxAttempts} attempts")
        //             }
        //         }
        //     }
        // }
        
        stage('Cleanup') {
            steps {
                script {
                    sh """
                        docker system prune -a -f || true
                        docker system df
                    """
                    

                }
            }
        }
    }
}
