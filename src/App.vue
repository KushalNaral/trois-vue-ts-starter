<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div class="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
            <div class="container mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            🏠
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">
                                Room Designer Studio
                            </h3>
                            <p class="text-sm text-gray-500">Create your perfect space</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <select v-model="selectedTemplate" @change="applyTemplate"
                            class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option v-for="key in Object.keys(templates)" :key="key" :value="key">
                                {{ templates[key].icon }} {{ templates[key].name }}
                            </option>
                        </select>
                        <div class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                            {{ visibleItemsCount }}/{{ totalItemsCount }} items
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex h-[calc(100vh-80px)]">
            <!-- Sidebar -->
            <div class="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col">
                <div class="p-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-800 mb-3">Item Library</h2>
                    <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
                        <button v-for="category in categories" :key="category" @click="selectedCategory = category"
                            :class="[
                                'px-3 py-1 text-sm font-medium rounded-md transition-all capitalize',
                                selectedCategory === category
                                    ? 'bg-white text-blue-600'
                                    : 'text-gray-600 hover:text-blue-800',
                            ]">
                            {{ category }}
                        </button>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-3">
                    <div v-for="(item, key) in filteredItems" :key="key" @click="selectItem(key)" :class="[
                        'cursor-pointer transition-all rounded-lg p-4 border-2',
                        'hover:shadow-md hover:scale-[1.02]',
                        selectedItem === key
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white/50 hover:bg-gray-50',
                    ]">
                        <div class="flex items-center gap-3 justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-semibold shadow-sm"
                                    :style="{ backgroundColor: item.color }">
                                    {{ item.icon }}
                                </div>
                                <div>
                                    <h3 class="font-medium text-gray-800">{{ item.name }}</h3>
                                    <p class="text-sm text-gray-600">{{ item.description }}</p>
                                    <div
                                        class="mt-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 inline-block">
                                        {{ item.category }}
                                    </div>
                                </div>
                            </div>
                            <button @click.stop="toggleItemVisibility(key)" :class="[
                                'p-2 rounded-lg transition-colors',
                                item.visible
                                    ? 'text-blue-600 hover:bg-blue-100'
                                    : 'text-gray-400 hover:bg-gray-100',
                            ]">
                                {{ item.visible ? "👁️" : "👁️‍🗨️" }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3D Viewport -->
            <div class="flex-1 relative">
                <TresCanvas ref="canvasRef" v-bind="state" clear-color="#f8fafc" shadows window-size alpha>
                    <TresPerspectiveCamera :position="[0, 5, 10]" />
                    <OrbitControls :enable-damping="true" :enable-pan="false" :min-distance="8" :max-distance="15"
                        :max-polar-angle="Math.PI / 2.2" :min-polar-angle="Math.PI / 6" />

                    <!-- Lighting -->
                    <TresAmbientLight :intensity="0.6" />
                    <TresDirectionalLight :position="[10, 10, 5]" :intensity="0.9" cast-shadow />
                    <TresPointLight :position="[-5, 8, 2]" :intensity="0.5" color="#ffd700" />
                    <TresPointLight :position="[5, 3, 5]" :intensity="0.4" color="#87ceeb" />

                    <!-- Room Structure -->
                    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -2, 0]" receive-shadow>
                        <TresPlaneGeometry :args="[20, 20]" />
                        <TresMeshStandardMaterial color="#f8fafc" :roughness="0.7" />
                    </TresMesh>
                    <TresMesh :position="[0, 4, -8]" receive-shadow>
                        <TresPlaneGeometry :args="[20, 12]" />
                        <TresMeshStandardMaterial color="#f1f5f9" :roughness="0.6" />
                    </TresMesh>
                    <TresMesh :rotation="[0, Math.PI / 2, 0]" :position="[-10, 4, 0]" receive-shadow>
                        <TresPlaneGeometry :args="[16, 12]" />
                        <TresMeshStandardMaterial color="#f8fafc" :roughness="0.6" />
                    </TresMesh>
                    <TresMesh :rotation="[0, -Math.PI / 2, 0]" :position="[10, 4, 0]" receive-shadow>
                        <TresPlaneGeometry :args="[16, 12]" />
                        <TresMeshStandardMaterial color="#f8fafc" :roughness="0.6" />
                    </TresMesh>

                    <!-- GLTF Models -->
                    <Suspense v-for="itemKey in validItemKeys" :key="itemKey">
                        <template #default>
                            <TresGroup v-if="
                                roomItems[itemKey]?.visible &&
                                !roomItems[itemKey]?.error &&
                                gltfModels[itemKey]?.scene
                            " :ref="(el) => setRef(itemKey, el)" :position="[
                    roomItems[itemKey].position.x,
                    roomItems[itemKey].position.y,
                    roomItems[itemKey].position.z,
                ]" :rotation="[
                    roomItems[itemKey].rotation.x,
                    roomItems[itemKey].rotation.y,
                    roomItems[itemKey].rotation.z,
                ]" :scale="[
                    roomItems[itemKey].scale,
                    roomItems[itemKey].scale,
                    roomItems[itemKey].scale,
                ]" @click="selectItem(itemKey)" 
                                receive-shadow cast-shadow>
                                <primitive :object="gltfModels[itemKey].scene" />
                            </TresGroup>
                        </template>
                        <template #fallback>
                            <TresMesh v-if="roomItems[itemKey]?.visible" :position="[
                                roomItems[itemKey].position.x,
                                roomItems[itemKey].position.y + 1,
                                roomItems[itemKey].position.z,
                            ]" :rotation="[frame / 100, frame / 100, frame / 100]">
                                <TresBoxGeometry :args="[0.5, 0.5, 0.5]" />
                                <TresMeshStandardMaterial color="#3b82f6" :emissive="'#3b82f6'"
                                    :emissive-intensity="0.5" />
                            </TresMesh>
                        </template>
                    </Suspense>
                    <!-- Fallback Geometries -->
                    <TresMesh v-for="itemKey in validItemKeys"
                        v-if="roomItems[itemKey]?.visible && roomItems[itemKey]?.error" :key="`fallback-${itemKey}`"
                        :ref="(el) => setRef(`${itemKey}Fallback`, el)" :position="[
                            roomItems[itemKey].position.x,
                            roomItems[itemKey].position.y,
                            roomItems[itemKey].position.z,
                        ]" :rotation="[
                roomItems[itemKey].rotation.x,
                roomItems[itemKey].rotation.y,
                roomItems[itemKey].rotation.z,
            ]" :scale="[
                roomItems[itemKey].scale,
                roomItems[itemKey].scale,
                roomItems[itemKey].scale,
            ]" receive-shadow cast-shadow @click="selectItem(itemKey)"
                    >
                        <TresBoxGeometry :args="[
                            roomItems[itemKey].fallbackSize.width,
                            roomItems[itemKey].fallbackSize.height,
                            roomItems[itemKey].fallbackSize.depth,
                        ]" />
                        <TresMeshStandardMaterial color="#ff0000" />
                    </TresMesh>
                </TresCanvas>

                <!-- Controls Overlay -->
                <div class="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-lg p-2 shadow-lg">
                    <div class="flex gap-1">
                        <button @click="resetCamera"
                            class="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Reset Camera">
                            🔍
                        </button>
                        <button @click="toggleDragControls" :class="[
                            'p-2 rounded-md transition-colors',
                            dragEnabled
                                ? 'text-blue-600 bg-blue-100'
                                : 'text-gray-600 hover:bg-gray-100',
                        ]" title="Toggle Drag Controls">
                            ✋
                        </button>
                        <button @click="showSettings" :class="[
                            'p-2 rounded-md transition-colors',
                            showSettingsPanel
                                ? 'text-blue-600 bg-blue-100'
                                : 'text-gray-600 hover:bg-gray-100',
                        ]" title="Settings">
                            ⚙️
                        </button>
                    </div>
                </div>

                <!-- Settings Panel -->
                <div v-if="showSettingsPanel"
                    class="absolute top-16 right-4 bg-white/80 backdrop-blur-md rounded-lg p-4 shadow-lg w-64">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gray-800">Settings</h3>
                        <button @click="showSettingsPanel = false" class="p-1 text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="text-sm text-gray-600 mb-2 block">Background Color</label>
                            <input type="color" v-model="state.clearColor" class="w-full h-8 rounded" />
                        </div>
                        <div>
                            <label class="text-sm text-gray-600 mb-2 block flex items-center justify-between">
                                Ambient Light
                                <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{{
                                    Math.round(ambientLightIntensity * 100)
                                    }}%</span>
                            </label>
                            <input type="range" v-model="ambientLightIntensity" min="0" max="1" step="0.1"
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                        </div>
                    </div>
                </div>

                <!-- Performance Stats -->
                <div class="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-white text-sm">
                    <div>
                        FPS: <span class="text-green-400 font-mono">{{ fps }}</span>
                    </div>
                    <div>
                        Template:
                        <span class="text-blue-400">{{
                            templates[selectedTemplate]?.name
                            }}</span>
                    </div>
                </div>

                <!-- Toast Notification -->
                <div v-if="toastMessage"
                    class="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300"
                    :class="{ 'opacity-0': !toastMessage }">
                    {{ toastMessage }}
                </div>
            </div>

            <!-- Right Sidebar -->
            <div :class="[
                'w-96 bg-white/80 backdrop-blur-xl border-l border-gray-200 transition-transform duration-300 fixed top-[80px] right-0 h-[calc(100vh-80px)]',
                selectedItem ? 'translate-x-0' : 'translate-x-full',
            ]">
                <div v-if="selectedItem" class="h-full flex flex-col">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">
                                Customize Item
                            </h2>
                            <button @click="selectedItem = null"
                                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                ✕
                            </button>
                        </div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md"
                                :style="{ backgroundColor: selectedItemData?.color }">
                                {{ selectedItemData?.icon }}
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-800">
                                    {{ selectedItemData?.name }}
                                </h3>
                                <p class="text-sm text-gray-600">
                                    {{ selectedItemData?.description }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6 space-y-6">
                        <!-- Style Variants -->
                        <div>
                            <h4 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                🎨 Style Variants
                            </h4>
                            <div class="grid grid-cols-2 gap-3">
                                <div v-for="(variant, index) in getItemVariants(selectedItem)" :key="index"
                                    @click="applyVariant(selectedItem, variant)" :class="[
                                        'cursor-pointer transition-all rounded-lg p-3 text-center border-2',
                                        'hover:shadow-md hover:scale-105',
                                        isCurrentVariant(selectedItem, variant)
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300',
                                    ]">
                                    <div class="w-12 h-12 mx-auto mb-2 rounded-lg border-2 border-gray-200 shadow-inner"
                                        :style="{ backgroundColor: variant.color }"></div>
                                    <p class="text-sm font-medium text-gray-700">
                                        {{ variant.name }}
                                    </p>
                                    <p class="text-xs text-gray-500">{{ variant.style }}</p>
                                    <div
                                        class="mt-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 inline-block">
                                        {{ variant.mood }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Transform Controls -->
                        <div>
                            <h4 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                📐 Transform
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-sm text-gray-600 mb-2 block flex items-center justify-between">
                                        Scale
                                        <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{{
                                            Math.round(selectedItemData?.scale * 100) }}%</span>
                                    </label>
                                    <input type="range" :value="selectedItemData?.scale * 100"
                                        @input="updateItemScale($event.target.valueAsNumber / 100)" min="50" max="200"
                                        step="10"
                                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>50%</span>
                                        <span>200%</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="text-sm text-gray-600 mb-2 block flex items-center justify-between">
                                        Rotation Y
                                        <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{{
                                            Math.round(
                                                (selectedItemData?.rotation.y * 180) / Math.PI,
                                            )
                                            }}°</span>
                                    </label>
                                    <input type="range" :value="(selectedItemData?.rotation.y * 180) / Math.PI" @input="
                                        updateItemRotation(
                                            'y',
                                            ($event.target.valueAsNumber * Math.PI) / 180,
                                        )
                                        " min="0" max="360" step="15"
                                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                                </div>
                            </div>
                        </div>
                        <!-- Position Controls -->
                        <div>
                            <h4 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                📍 Position
                            </h4>
                            <div class="grid grid-cols-3 gap-2">
                                <div v-for="axis in ['x', 'y2', 'z']" :key="axis">
                                    <label class="text-sm text-gray-600 mb-2 block flex items-center justify-between">
                                        {{ axis.toUpperCase() }}
                                        <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{{
                                            Math.round(
                                                selectedItemData?.position[
                                                axis === "y2" ? "y" : axis
                                            ] * 10,
                                            ) / 10
                                            }}</span>
                                    </label>
                                    <input type="range" :value="selectedItemData?.position[axis === 'y2' ? 'y' : axis]
                                        " @input="
                        updateItemPosition(
                            axis === 'y2' ? 'y' : axis,
                            $event.target.valueAsNumber,
                        )
                        " :min="axis === 'y2' ? -2 : -10" :max="axis === 'y2' ? 2 : 10" step="0.1"
                                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                                </div>
                            </div>
                        </div>
                        <!-- Visibility Toggle -->
                        <div
                            class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                            <div>
                                <p class="font-medium text-gray-800">Visible in Room</p>
                                <p class="text-sm text-gray-600">Show or hide this item</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" :checked="selectedItemData?.visible"
                                    @change="updateItemProperty('visible', $event.target.checked)"
                                    class="sr-only peer" />
                                <div
                                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                </div>
                            </label>
                        </div>
                    </div>
                    <!-- Action Buttons -->
                    <div class="p-6 border-t border-gray-200 space-y-3">
                        <button @click="resetItem(selectedItem)"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center justify-center gap-2">
                            🔄 Reset to Default
                        </button>
                        <button @click="applyChanges"
                            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                            ✨ Apply Changes
                        </button>
                    </div>
                </div>
                <div v-else class="h-full flex items-center justify-center p-6">
                    <div class="text-center">
                        <div
                            class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                            ⚙️
                        </div>
                        <h3 class="font-medium text-gray-700 mb-2">No Item Selected</h3>
                        <p class="text-sm text-gray-600 max-w-sm">
                            Select an item from the library to customize its appearance and
                            properties.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div class="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-full px-6 py-3 shadow-lg">
                <div class="flex items-center gap-4">
                    <button @click="resetRoom"
                        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors font-medium flex items-center gap-2">
                        🔄 Reset Room
                    </button>
                    <div class="w-px h-6 bg-gray-300"></div>
                    <button @click="saveConfiguration"
                        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg">
                        💾 Save Design
                    </button>
                    <button @click="loadConfiguration"
                        class="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-full transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg">
                        📂 Load Design
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    reactive,
    computed,
    watch,
    onMounted,
    onUnmounted,
    nextTick,
    shallowRef,
    markRaw,
} from "vue";
import { TresCanvas, useRenderLoop } from "@tresjs/core";
import { OrbitControls, useGLTF } from "@tresjs/cientos";
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

// Interfaces
interface Vector3 {
    x: number;
    y: number;
    z: number;
}
interface Item {
    visible: boolean;
    position: Vector3;
    rotation: Vector3;
    scale: number;
    color: string;
    modelPath: string;
    name: string;
    category: string;
    icon: string;
    description: string;
    defaultValues: {
        scale: number;
        rotation: Vector3;
        color: string;
        modelPath: string;
    };
    error: boolean;
    fallbackSize: { width: number; height: number; depth: number };
}
interface Variant {
    name: string;
    modelPath?: string;
    color: string;
    style: string;
    mood: string;
}
interface TemplateConfig {
    [key: string]: { color: string; visible: boolean; modelPath?: string };
}
interface Template {
    name: string;
    theme: string;
    icon: string;
    config: TemplateConfig;
}

// State
const state = reactive({
    Physical: true,
    alpha: true,
    clearColor: "#f8fafc",
});
const canvasRef = ref<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: any;
} | null>(null);
const selectedItem = ref<string | null>(null);
const selectedTemplate = ref("modern");
const selectedCategory = ref("all");
const fps = ref(60);
const dragEnabled = ref(false);
const dragControls = ref<DragControls | null>(null);
const ambientLightIntensity = ref(0.6);
const showSettingsPanel = ref(false);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const originalMaterials = new Map<string, THREE.Material[]>();
const toastMessage = ref<string | null>(null);
const toastTimeout = ref<NodeJS.Timeout | null>(null);
const frame = ref(0);
const refs = ref<Record<string, THREE.Group>>({});
const gltfModels = shallowRef<Record<string, { scene: THREE.Group }>>({});
let lastFrameTime = performance.now();

// Optimize renderer settings
const rendererSettings = {
    shadowMap: {
        enabled: true,
        type: THREE.PCFSoftShadowMap,
        autoUpdate: true,
    },
};

// Animation for loading spinner and FPS
useRenderLoop().onBeforeLoop(() => {
    frame.value = (frame.value + 1) % 100;
    const now = performance.now();
    fps.value = Math.round(1000 / (now - lastFrameTime)) || 60;
    lastFrameTime = now;
});

// Room items
const roomItems = reactive<Record<string, Item>>({
    sofa: {
        visible: true,
        position: { x: 0, y: -1.25, z: 2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#8B4513",
        modelPath: "/glb/BC-MB.glb",
        name: "Modern Sofa",
        category: "furniture",
        icon: "🛋️",
        description: "Comfortable seating for relaxation",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#8B4513",
            modelPath: "/ Shape/B Shape.glb",
        },
        error: false,
        fallbackSize: { width: 4, height: 1.5, depth: 2 },
    },
    coffeeTable: {
        visible: true,
        position: { x: 0, y: -1.85, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#654321",
        modelPath: "/glb/DESK-ECUL24C24E.glb",
        name: "Coffee Table",
        category: "furniture",
        icon: "☕",
        description: "Perfect for drinks and magazines",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#654321",
            modelPath: "/glb/DESK-ECUL24C24E.glb",
        },
        error: false,
        fallbackSize: { width: 2, height: 0.3, depth: 1 },
    },
    tvStand: {
        visible: true,
        position: { x: 0, y: -1.6, z: -6 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#2F4F4F",
        modelPath: "/glb/DESK-FMB.glb",
        name: "TV Stand",
        category: "furniture",
        icon: "📺",
        description: "Sleek entertainment center",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#2F4F4F",
            modelPath: "/glb/DESK-FMB.glb",
        },
        error: false,
        fallbackSize: { width: 3, height: 0.8, depth: 0.8 },
    },
    tv: {
        visible: true,
        position: { x: 0, y: -0.75, z: -5.95 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#000000",
        modelPath: "/glb/KIT-BC-1D102VD.glb",
        name: "Smart TV",
        category: "electronics",
        icon: "📱",
        description: "Ultra HD entertainment display",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#000000",
            modelPath: "/glb/KIT-BC-1D102VD.glb",
        },
        error: false,
        fallbackSize: { width: 2.5, height: 1.5, depth: 0.1 },
    },
    lamp: {
        visible: true,
        position: { x: 4, y: -0.4, z: 2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#FFD700",
        modelPath: "/glb/LST-2D-LL-GD.glb",
        name: "Table Lamp",
        category: "lighting",
        icon: "💡",
        description: "Ambient lighting solution",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#FFD700",
            modelPath: "/glb/LST-2D-LL-GD.glb",
        },
        error: false,
        fallbackSize: { width: 0.3, height: 2, depth: 0.3 },
    },
    bookshelf: {
        visible: true,
        position: { x: -7, y: 0, z: -2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#8B4513",
        modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
        name: "Bookshelf",
        category: "storage",
        icon: "📚",
        description: "Display your favorite books",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#8B4513",
            modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
        },
        error: false,
        fallbackSize: { width: 1.5, height: 4, depth: 0.8 },
    },
    plant: {
        visible: true,
        position: { x: 6, y: -1.5, z: -1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#228B22",
        modelPath: "/glb/BSC-OP.glb",
        name: "Decorative Plant",
        category: "decor",
        icon: "🌱",
        description: "Brings life to your space",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#228B22",
            modelPath: "/glb/BSC-OP.glb",
        },
        error: false,
        fallbackSize: { width: 1, height: 1, depth: 1 },
    },
    door: {
        visible: true,
        position: { x: 0, y: -2, z: -8 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: 1,
        color: "#8B4513",
        modelPath: "/glb/door.glb",
        name: "Room Door",
        category: "decor",
        icon: "🚪",
        description: "Entryway to your space",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: Math.PI, z: 0 },
            color: "#8B4513",
            modelPath: "/glb/door.glb",
        },
        error: false,
        fallbackSize: { width: 2, height: 4, depth: 0.2 },
    },
    bin: {
        visible: true,
        position: { x: 8, y: -2, z: -6 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        color: "#4B5EAA",
        modelPath: "/glb/steel_bin.glb",
        name: "Steel Bin",
        category: "decor",
        icon: "🗑️",
        description: "Modern waste bin",
        defaultValues: {
            scale: 1,
            rotation: { x: 0, y: 0, z: 0 },
            color: "#4B5EAA",
            modelPath: "/glb/steel_bin.glb",
        },
        error: false,
        fallbackSize: { width: 0.5, height: 1, depth: 0.5 },
    },
});

// Item variants
const itemVariants: Record<string, Variant[]> = {
    sofa: [
        {
            name: "Modern Classic",
            modelPath: "/glb/BC-MB.glb",
            color: "#8B4513",
            style: "Traditional",
            mood: "Warm",
        },
        {
            name: "Retro Chic",
            modelPath: "/glb/BC-MB.glb",
            color: "#708090",
            style: "Contemporary",
            mood: "Cool",
        },
    ],
    coffeeTable: [
        {
            name: "Corner Left",
            modelPath: "/glb/DESK-ECUL24C24E.glb",
            color: "#654321",
            style: "Traditional",
            mood: "Warm",
        },
        {
            name: "Corner Right",
            modelPath: "/glb/DESK-ECUL24C24E.glb",
            color: "#e0f2fe",
            style: "Contemporary",
            mood: "Light",
        },
    ],
    tvStand: [
        {
            name: "Bold Modern",
            modelPath: "/glb/DESK-FMB.glb",
            color: "#2F4F4F",
            style: "Modern",
            mood: "Sleek",
        },
        {
            name: "Retro",
            modelPath: "/glb/DESK-FMB.glb",
            color: "#8B4513",
            style: "Traditional",
            mood: "Warm",
        },
    ],
    tv: [
        {
            name: "Large Unit",
            modelPath: "/glb/KIT-BC-1D102VD.glb",
            color: "#000000",
            style: "Standard",
            mood: "Neutral",
        },
        {
            name: "Compact Unit",
            modelPath: "/glb/KIT-BC-1D102VD.glb",
            color: "#cbd5e1",
            style: "Modern",
            mood: "Sleek",
        },
    ],
    lamp: [
        {
            name: "Short Light",
            modelPath: "/glb/LST-2D-LL-GD.glb",
            color: "#FFD700",
            style: "Modern",
            mood: "Crisp",
        },
        {
            name: "Decorative",
            modelPath: "/glb/LST-2D-LL-GD.glb",
            color: "#d97706",
            style: "Retro",
            mood: "Nostalgic",
        },
    ],
    bookshelf: [
        {
            name: "Double Hutch",
            modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
            color: "#8B4513",
            style: "Traditional",
            mood: "Warm",
        },
        {
            name: "Open Shelf",
            modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
            color: "#1e293b",
            style: "Industrial",
            mood: "Bold",
        },
    ],
    plant: [
        {
            name: "Decor Plant",
            modelPath: "/glb/BSC-OP.glb",
            color: "#228B22",
            style: "Tropical",
            mood: "Fresh",
        },
        {
            name: "Small Decor",
            modelPath: "/glb/BSC-OP.glb",
            color: "#65a30d",
            style: "Minimal",
            mood: "Zen",
        },
    ],
    door: [
        {
            name: "Standard Door",
            modelPath: "/glb/door.glb",
            color: "#8B4513",
            style: "Traditional",
            mood: "Classic",
        },
        {
            name: "Modern Door",
            modelPath: "/glb/door.glb",
            color: "#f8fafc",
            style: "Contemporary",
            mood: "Clean",
        },
    ],
    bin: [
        {
            name: "Steel Bin",
            modelPath: "/glb/steel_bin.glb",
            color: "#4B5EAA",
            style: "Modern",
            mood: "Functional",
        },
        {
            name: "Simple Bin",
            modelPath: "/glb/steel_bin.glb",
            color: "#708090",
            style: "Contemporary",
            mood: "Neutral",
        },
    ],
};

// Templates
const templates: Record<string, Template> = {
    modern: {
        name: "Modern Minimalist",
        theme: "Clean lines, neutral colors",
        icon: "🏢",
        config: {
            sofa: { color: "#708090", visible: true, modelPath: "/glb/BC-MB.glb" },
            coffeeTable: {
                color: "#e0f2fe",
                visible: true,
                modelPath: "/glb/DESK-ECUL24C24E.glb",
            },
            tvStand: {
                color: "#2F4F4F",
                visible: true,
                modelPath: "/glb/DESK-FMB.glb",
            },
            tv: {
                color: "#cbd5e1",
                visible: true,
                modelPath: "/glb/KIT-BC-1D102VD.glb",
            },
            lamp: {
                color: "#FFD700",
                visible: true,
                modelPath: "/glb/LST-2D-LL-GD.glb",
            },
            bookshelf: {
                color: "#1e293b",
                visible: true,
                modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
            },
            plant: { color: "#228B22", visible: true, modelPath: "/glb/BSC-OP.glb" },
            door: { color: "#f8fafc", visible: true, modelPath: "/glb/door.glb" },
            bin: { color: "#708090", visible: true, modelPath: "/glb/steel_bin.glb" },
        },
    },
    cozy: {
        name: "Cozy Sanctuary",
        theme: "Warm tones, comfortable vibes",
        icon: "🏠",
        config: {
            sofa: { color: "#8B4513", visible: true, modelPath: "/glb/BC-MB.glb" },
            coffeeTable: {
                color: "#654321",
                visible: true,
                modelPath: "/glb/DESK-ECUL24C24E.glb",
            },
            tvStand: {
                color: "#8B4513",
                visible: false,
                modelPath: "/glb/DESK-FMB.glb",
            },
            tv: {
                color: "#000000",
                visible: false,
                modelPath: "/glb/KIT-BC-1D102VD.glb",
            },
            lamp: {
                color: "#d97706",
                visible: true,
                modelPath: "/glb/LST-2D-LL-GD.glb",
            },
            bookshelf: {
                color: "#8B4513",
                visible: true,
                modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
            },
            plant: { color: "#65a30d", visible: true, modelPath: "/glb/BSC-OP.glb" },
            door: { color: "#8B4513", visible: true, modelPath: "/glb/door.glb" },
            bin: { color: "#4B5EAA", visible: true, modelPath: "/glb/steel_bin.glb" },
        },
    },
    luxury: {
        name: "Luxury Lounge",
        theme: "Premium materials, rich colors",
        icon: "✨",
        config: {
            sofa: { color: "#8B4513", visible: true, modelPath: "/glb/BC-MB.glb" },
            coffeeTable: {
                color: "#654321",
                visible: true,
                modelPath: "/glb/DESK-ECUL24C24E.glb",
            },
            tvStand: {
                color: "#2F4F4F",
                visible: true,
                modelPath: "/glb/DESK-FMB.glb",
            },
            tv: {
                color: "#000000",
                visible: true,
                modelPath: "/glb/KIT-BC-1D102VD.glb",
            },
            lamp: {
                color: "#FFD700",
                visible: true,
                modelPath: "/glb/LST-2D-LL-GD.glb",
            },
            bookshelf: {
                color: "#8B4513",
                visible: true,
                modelPath: "/glb/HUTCH-DM-2HDC-GD.glb",
            },
            plant: { color: "#228B22", visible: true, modelPath: "/glb/BSC-OP.glb" },
            door: { color: "#f8fafc", visible: true, modelPath: "/glb/door.glb" },
            bin: { color: "#708090", visible: true, modelPath: "/glb/steel_bin.glb" },
        },
    },
};

// Computed properties
const categories = computed(() => {
    const cats = new Set<string>(["all"]);
    Object.values(roomItems).forEach((item) => cats.add(item.category));
    return Array.from(cats);
});

const filteredItems = computed(() => {
    if (selectedCategory.value === "all") return roomItems;
    return Object.fromEntries(
        Object.entries(roomItems).filter(
            ([_, item]) => item.category === selectedCategory.value,
        ),
    );
});

const visibleItemsCount = computed(
    () => Object.values(roomItems).filter((item) => item.visible).length,
);
const totalItemsCount = computed(() => Object.keys(roomItems).length);
const selectedItemData = computed(() =>
    selectedItem.value ? roomItems[selectedItem.value] : null,
);
const validItemKeys = computed(() =>
    Object.keys(roomItems).filter((key) => roomItems[key] !== undefined),
);

const getItemVariants = (itemKey: string) => itemVariants[itemKey] || [];
const isCurrentVariant = (itemKey: string, variant: Variant) => {
    const item = roomItems[itemKey];
    return (
        item?.color === variant.color &&
        (!variant.modelPath || item?.modelPath === variant.modelPath)
    );
};

// Methods
const setRef = (key: string, el: THREE.Group | null) => {
    if (el) {
        refs.value[key] = markRaw(el); // Prevent Vue from proxying Three.js objects
    } else {
        delete refs.value[key];
    }
};

const showToast = (message: string, duration = 3000) => {
    if (toastTimeout.value) clearTimeout(toastTimeout.value);
    toastMessage.value = message;
    toastTimeout.value = setTimeout(() => {
        toastMessage.value = null;
        toastTimeout.value = null;
    }, duration);
};

const applyTemplate = async () => {
    const template = templates[selectedTemplate.value];
    if (!template) {
        showToast("Invalid template selected", 3000);
        return;
    }
    Object.entries(template.config).forEach(([key, config]) => {
        if (roomItems[key]) {
            const item = roomItems[key];
            item.color = config.color;
            item.visible = config.visible;
            item.scale = item.defaultValues.scale;
            item.rotation = { ...item.defaultValues.rotation };
            item.position = { ...item.defaultValues.position };
            if (config.modelPath) item.modelPath = config.modelPath;
            item.error = false;
        } else {
            console.warn(`Item ${key} not found in roomItems`);
        }
    });
    gltfModels.value = {};
    await nextTick();
    setupDragControls();
    showToast(`Template ${template.name} applied!`, 3000);
};

const selectItem = (key: string) => {
    if (roomItems[key]) {
        selectedItem.value = key;
        showSettingsPanel.value = false;
    }
};

const toggleItemVisibility = (key: string) => {
    const item = roomItems[key];
    if (item) {
        item.visible = !item.visible;
        if (!item.visible) {
            disposeGLTF(key);
        }
        setupDragControls();
    }
};

const applyVariant = async (itemKey: string, variant: Variant) => {
    const item = roomItems[itemKey];
    if (item) {
        item.color = variant.color;
        if (variant.modelPath && item.modelPath !== variant.modelPath) {
            item.modelPath = variant.modelPath;
            disposeGLTF(itemKey);
            await loadGLTF(itemKey, item);
        }
        if (refs.value[itemKey]?.traverse) {
            refs.value[itemKey].traverse((child: any) => {
                if (child.isMesh && child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: variant.color,
                        roughness: 0.7,
                        metalness: 0.1,
                    });
                }
            });
        }
        showToast(`Applied ${variant.name} to ${item.name}`, 3000);
    }
};

const updateItemScale = (value: number) => {
    if (selectedItem.value) {
        const item = roomItems[selectedItem.value];
        if (item) {
            item.scale = Math.max(0.5, Math.min(2, value));
            if (refs.value[selectedItem.value]) {
                const group = refs.value[selectedItem.value];
                group.scale.set(item.scale, item.scale, item.scale);
            }
        }
    }
};

const updateItemPosition = (axis: "x" | "y" | "z", value: number) => {
    if (selectedItem.value) {
        const item = roomItems[selectedItem.value];
        if (item) {
            item.position[axis] = Math.max(
                axis === "y" ? -2 : -10,
                Math.min(axis === "y" ? 2 : 10, value),
            );
            if (refs.value[selectedItem.value]) {
                const group = refs.value[selectedItem.value];
                group.position[axis] = item.position[axis];
            }
        }
    }
};

const updateItemProperty = (property: "visible", value: boolean) => {
    if (selectedItem.value) {
        const item = roomItems[selectedItem.value];
        if (item && property === "visible") {
            item.visible = value;
            if (!item.visible) {
                disposeGLTF(selectedItem.value);
            }
            setupDragControls();
        }
    }
};

const updateItemRotation = (axis: "y", value: number) => {
    if (selectedItem.value) {
        const item = roomItems[selectedItem.value];
        if (item) {
            item.rotation[axis] = value;
            if (refs.value[selectedItem.value]) {
                const group = refs.value[selectedItem.value];
                group.rotation[axis] = value;
            }
        }
    }
};

const resetItem = async (itemKey: string) => {
    const item = roomItems[itemKey];
    if (item) {
        item.scale = item.defaultValues.scale;
        item.rotation = { ...item.defaultValues.rotation };
        item.position = { ...item.defaultValues.position };
        item.color = item.defaultValues.color;
        item.visible = true;
        if (item.modelPath !== item.defaultValues.modelPath) {
            item.modelPath = item.defaultValues.modelPath;
            disposeGLTF(itemKey);
            await loadGLTF(itemKey, item);
        }
        if (refs.value[itemKey]) {
            const group = refs.value[itemKey];
            group.position.set(item.position.x, item.position.y, item.position.z);
            group.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
            group.scale.set(item.scale, item.scale, item.scale);
        }
        setupDragControls();
        showToast(`${item.name} reset to default`, 3000);
    }
};

const applyChanges = () => {
    if (selectedItem.value) {
        const item = roomItems[selectedItem.value];
        if (item) {
            showToast(`${item.name} changes applied!`, 3000);
        }
    }
};

const resetRoom = async () => {
    Object.entries(roomItems).forEach(([key, item]) => {
        item.scale = item.defaultValues.scale;
        item.rotation = { ...item.defaultValues.rotation };
        item.position = { ...item.defaultValues.position };
        item.color = item.defaultValues.color;
        item.visible = true;
        item.modelPath = item.defaultValues.modelPath;
        item.error = false;
        disposeGLTF(key);
    });
    gltfModels.value = {};
    selectedTemplate.value = "modern";
    selectedItem.value = null;
    showSettingsPanel.value = false;
    await applyTemplate();
    showToast("Room reset to default", 3000);
};

const saveConfiguration = () => {
    const config = {
        template: selectedTemplate.value,
        items: Object.fromEntries(
            Object.entries(roomItems).map(([key, item]) => [
                key,
                {
                    visible: item.visible,
                    position: { ...item.position },
                    rotation: { ...item.rotation },
                    scale: item.scale,
                    color: item.color,
                    modelPath: item.modelPath,
                },
            ]),
        ),
    };
    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "room_design.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    showToast("Design saved to file!", 3000);
};

const loadConfiguration = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            try {
                const text = await file.text();
                const config = JSON.parse(text);
                if (config.template && templates[config.template]) {
                    selectedTemplate.value = config.template;
                    await applyTemplate();
                }
                if (config.items) {
                    Object.entries(config.items).forEach(([key, item]: [string, any]) => {
                        if (roomItems[key]) {
                            roomItems[key].visible =
                                item.visible ?? roomItems[key].defaultValues.visible;
                            roomItems[key].position = item.position ?? {
                                ...roomItems[key].defaultValues.position,
                            };
                            roomItems[key].rotation = item.rotation ?? {
                                ...roomItems[key].defaultValues.rotation,
                            };
                            roomItems[key].scale =
                                item.scale ?? roomItems[key].defaultValues.scale;
                            roomItems[key].color =
                                item.color ?? roomItems[key].defaultValues.color;
                            roomItems[key].modelPath =
                                item.modelPath ?? roomItems[key].defaultValues.modelPath;
                            roomItems[key].error = false;
                            disposeGLTF(key);
                        }
                    });
                    gltfModels.value = {};
                    await nextTick();
                    setupDragControls();
                    showToast("Design loaded successfully!", 3000);
                }
            } catch (error) {
                console.error("Failed to load configuration:", error);
                showToast("Failed to load design", 3000);
            }
        }
    };
    input.click();
};

const showSettings = () => {
    showSettingsPanel.value = !showSettingsPanel.value;
    selectedItem.value = null;
};

const resetCamera = () => {
    const controls = canvasRef.value?.controls;
    if (controls) {
        controls.reset();
        controls.target.set(0, 0, 0);
        controls.update();
    }
};

const toggleDragControls = () => {
    dragEnabled.value = !dragEnabled.value;
    if (dragControls.value) {
        dragControls.value.enabled = dragEnabled.value;
    }
    showToast(
        `Drag controls ${dragEnabled.value ? "enabled" : "disabled"}`,
        2000,
    );
};

const highlightItem = (itemKey: string) => {
    const mesh = refs.value[itemKey];
    if (mesh) {
        const materials: THREE.Material[] = [];
        mesh.traverse((child: any) => {
            if (child.isMesh && child.material) {
                materials.push(child.material.clone());
                child.material = new THREE.MeshStandardMaterial({
                    color: roomItems[itemKey].color,
                    emissive: "#00ff00",
                    emissiveIntensity: 0.3,
                    roughness: 0.7,
                    metalness: 0.1,
                });
            }
        });
        originalMaterials.set(itemKey, materials);
    }
};

const unhighlightItem = (itemKey: string) => {
    const mesh = refs.value[itemKey];
    if (mesh && originalMaterials.has(itemKey)) {
        const materials = originalMaterials.get(itemKey) as THREE.Material[];
        let materialIndex = 0;
        mesh.traverse((child: any) => {
            if (child.isMesh && materials[materialIndex]) {
                child.material = materials[materialIndex];
                materialIndex++;
            }
        });
        originalMaterials.delete(itemKey);
    }
};

const disposeGLTF = (key: string) => {
    if (gltfModels.value[key]?.scene) {
        gltfModels.value[key].scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material?.dispose();
                }
            }
        });
        delete gltfModels.value[key];
    }
};

// Load GLTF models with validation
const loadGLTF = async (key: string, item: Item) => {
    if (!item.visible || gltfModels.value[key]?.scene) return;
    try {
        const { scene } = await useGLTF(item.modelPath, { draco: true });
        // Validate scene
        if (!scene || !scene.isObject3D) {
            throw new Error("Invalid GLTF scene");
        }
        // Mark scene as non-reactive to prevent proxy issues
        const nonReactiveScene = markRaw(scene);
        nonReactiveScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    const material = Array.isArray(child.material)
                        ? child.material.map(
                            (mat) =>
                                new THREE.MeshStandardMaterial({
                                    color: item.color,
                                    roughness: 0.7,
                                    metalness: 0.1,
                                }),
                        )
                        : new THREE.MeshStandardMaterial({
                            color: item.color,
                            roughness: 0.7,
                            metalness: 0.1,
                        });
                    child.material = material;
                    // Ensure matrix properties are accessible
                    child.updateMatrix();
                    child.updateMatrixWorld();
                }
            }
        });
        gltfModels.value = {
            ...gltfModels.value,
            [key]: { scene: nonReactiveScene },
        };
        roomItems[key].error = false;
        await nextTick();
        setupDragControls();
    } catch (error) {
        console.error(`Failed to load GLTF for ${key}:`, error);
        roomItems[key].error = true;
        showToast(`Failed to load ${item.name}. Using fallback.`, 3000);
    }
};

// Watch for model changes
watch(
    () =>
        Object.entries(roomItems).map(([key, item]) => ({
            key,
            modelPath: item.modelPath,
            visible: item.visible,
            color: item.color,
        })),
    (items, oldItems) => {
        items.forEach(({ key, visible, modelPath, color }, index) => {
            const oldItem = oldItems ? oldItems[index] : null;
            if (
                visible &&
                (!gltfModels.value[key]?.scene ||
                    modelPath !== oldItem?.modelPath ||
                    color !== oldItem?.color)
            ) {
                disposeGLTF(key);
                loadGLTF(key, roomItems[key]);
            } else if (!visible && gltfModels.value[key]) {
                disposeGLTF(key);
                setupDragControls();
            }
        });
    },
    { deep: true, immediate: true },
);

// Watch for ambient light intensity changes
watch(ambientLightIntensity, (value) => {
    if (canvasRef.value?.scene) {
        const ambientLight = canvasRef.value.scene.children.find(
            (child) => child instanceof THREE.AmbientLight,
        ) as THREE.AmbientLight;
        if (ambientLight) {
            ambientLight.intensity = value;
        }
    }
});

// Watch for background color changes
watch(
    () => state.clearColor,
    (color) => {
        if (canvasRef.value?.renderer) {
            canvasRef.value.renderer.setClearColor(color);
        }
    },
);

// Setup DragControls and Raycasting
const setupDragControls = () => {
    if (
        !canvasRef.value?.camera ||
        !canvasRef.value?.renderer ||
        !canvasRef.value?.scene
    )
        return;
    if (dragControls.value) {
        dragControls.value.dispose();
        dragControls.value = null;
    }

    const draggableObjects = Object.keys(roomItems)
        .filter(
            (key) =>
                roomItems[key].visible && !roomItems[key].error && refs.value[key],
        )
        .map((key) => refs.value[key]);

    if (draggableObjects.length) {
        dragControls.value = new DragControls(
            draggableObjects,
            canvasRef.value.camera,
            canvasRef.value.renderer.domElement,
        );
        dragControls.value.enabled = dragEnabled.value;
        dragControls.value.addEventListener("dragstart", () => {
            if (canvasRef.value?.controls) {
                canvasRef.value.controls.enabled = false;
            }
        });
        dragControls.value.addEventListener("dragend", () => {
            if (canvasRef.value?.controls) {
                canvasRef.value.controls.enabled = true;
            }
        });
        dragControls.value.addEventListener("drag", (event) => {
            const object = event.object as THREE.Group;
            const key = Object.keys(refs.value).find((k) => refs.value[k] === object);
            if (key) {
                const item = roomItems[key];
                item.position = {
                    x: Math.max(-10, Math.min(10, object.position.x)),
                    y: Math.max(-2, Math.min(2, object.position.y)),
                    z: Math.max(-10, Math.min(10, object.position.z)),
                };
                // Ensure matrix is updated to avoid rendering issues
                object.updateMatrix();
                object.updateMatrixWorld();
            }
        });
    }
};

const onClick = (event: MouseEvent) => {
    if (
        dragEnabled.value ||
        !canvasRef.value?.camera ||
        !canvasRef.value?.scene ||
        showSettingsPanel.value
    )
        return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, canvasRef.value.camera);

    const objects = Object.keys(roomItems)
        .filter((key) => roomItems[key].visible && refs.value[key])
        .map((key) => refs.value[key]);

    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const key = Object.keys(refs.value).find((k) => {
            const group = refs.value[k];
            let found = false;
            group.traverse((child) => {
                if (child === intersectedObject) found = true;
            });
            return found;
        });
        if (key) {
            selectItem(key);
            showSettingsPanel.value = false;
        }
    } else {
        selectedItem.value = null;
    }
};

onMounted(() => {
    nextTick(() => {
        if (
            canvasRef.value?.camera &&
            canvasRef.value?.renderer &&
            canvasRef.value?.scene
        ) {
            // Apply renderer settings
            canvasRef.value.renderer.shadowMap.enabled =
                rendererSettings.shadowMap.enabled;
            canvasRef.value.renderer.shadowMap.type = rendererSettings.shadowMap.type;
            canvasRef.value.renderer.setClearColor(state.clearColor);
            setupDragControls();
            window.addEventListener("click", onClick);
        }
    });
});

onUnmounted(() => {
    window.removeEventListener("click", onClick);
    if (dragControls.value) {
        dragControls.value.dispose();
    }
    if (toastTimeout.value) {
        clearTimeout(toastTimeout.value);
    }
    Object.keys(gltfModels.value).forEach((key) => disposeGLTF(key));
    gltfModels.value = {};
    refs.value = {};
    originalMaterials.clear();
});
</script>
