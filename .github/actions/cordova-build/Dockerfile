# syntax=docker/dockerfile:1

FROM node:16-bullseye as build

# Install Java 11 and required tools
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk wget unzip git zip && \
    rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Install Android SDK command line tools
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    cd /tmp && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9123335_latest.zip -O cmdline-tools.zip && \
    unzip cmdline-tools.zip && \
    rm cmdline-tools.zip && \
    mv cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest

# Accept licenses and install required SDK packages
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2" "build-tools;32.0.0" "tools"

RUN wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip -O /tmp/gradle-7.4.2-bin.zip && \
    mkdir -p /opt/gradle && \
    unzip /tmp/gradle-7.4.2-bin.zip -d /opt/gradle && \
    rm /tmp/gradle-7.4.2-bin.zip && \
    ln -s /opt/gradle/gradle-7.4.2/bin/gradle /usr/bin/gradle

# Set ANDROID_HOME environment variable for legacy tools compatibility
ENV ANDROID_HOME=$ANDROID_SDK_ROOT

# Install Cordova CLI
RUN npm install -g cordova@11
RUN npm install -g @ionic/cli@6

# Set workdir and copy package files first for caching
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# WORKDIR /app
# COPY package*.json ./
# COPY config ./config
# COPY src/config.xml.hbs ./src/config.xml.hbs
# COPY cordova-setup.sh ./cordova-setup.sh
# COPY hooks ./hooks
# COPY www/static ./www/static

# # Install dependencies
# RUN npm ci

# # Copy the rest of the app
# COPY . .

# # Make hooks executable
# RUN chmod +x -R hooks/*.sh && chmod +x cordova-setup.sh

# # Cordova setup (platforms/plugins)
# RUN ./cordova-setup.sh

# # Build APK
# RUN npm run webpack:release:android

# # Final stage: minimal image with just the APK
# FROM busybox
# COPY --from=build /app/platforms/android/app/build/outputs/apk/debug/app-debug.apk /output/app-debug.apk

ENTRYPOINT ["/entrypoint.sh"]