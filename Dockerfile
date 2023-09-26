FROM ubuntu as builder
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install curl -y && curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y \
    wget \
    unzip \
    nodejs \    
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$PATH:$JAVA_HOME/bin"

RUN wget https://dl.google.com/android/repository/commandlinetools-linux-7583922_latest.zip -O sdk-tools-linux.zip \
    && mkdir -p /usr/local/android/sdk \
    && unzip sdk-tools-linux.zip -d /usr/local/android/sdk \
    && rm sdk-tools-linux.zip

ENV ANDROID_SDK_ROOT=/usr/local/android/sdk
ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"

RUN yes | /usr/local/android/sdk/cmdline-tools/bin/sdkmanager --sdk_root=/usr/local/android/sdk --licenses && yes | /usr/local/android/sdk/cmdline-tools/bin/sdkmanager --sdk_root=/usr/local/android/sdk "platforms;android-33" "build-tools;30.0.3" "extras;google;m2repository"

RUN apt-get clean


# FROM builder as final
# WORKDIR /app
# COPY package.json .
# RUN npm install
# COPY . .
# RUN npm i -g @ionic/cli
# RUN ionic cap sync android --prod 
# RUN chmod +x android/gradlew  
# RUN ./android/gradlew bundleRelease