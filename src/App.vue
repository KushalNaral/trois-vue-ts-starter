<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
  >
    <div
      class="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            >
              🏠
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-800">
                Room Designer Studio
              </h1>
              <p class="text-sm text-slate-500">Create your perfect space</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <select
              v-model="selectedTemplate"
              @change="applyTemplate"
              class="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
            >
              <option
                v-for="(template, key) in templates"
                :key="key"
                :value="key"
              >
                {{ template.icon }} {{ template.name }}
              </option>
            </select>
            <div
              class="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700"
            >
              {{ visibleItemsCount }}/{{ totalItemsCount }} items
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex h-[calc(100vh-80px)]">
      <div
        class="w-80 bg-white/70 backdrop-blur-xl border-r border-slate-200 overflow-hidden flex flex-col"
      >
        <div class="p-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800 mb-3">
            Item Library
          </h2>
          <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-all capitalize',
                selectedCategory === category
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800',
              ]"
            >
              {{ category }}
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="(item, key) in filteredItems"
            :key="key"
            @click="selectItem(key)"
            :class="[
              'cursor-pointer transition-all duration-200 rounded-lg p-4 border-2',
              'hover:shadow-md hover:scale-[1.02]',
              selectedItem === key
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 bg-white/50 hover:bg-slate-50',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-semibold shadow-sm"
                  :style="{ backgroundColor: item.color }"
                >
                  {{ item.icon }}
                </div>
                <div>
                  <h3 class="font-medium text-slate-800">{{ item.name }}</h3>
                  <p class="text-sm text-slate-500">{{ item.description }}</p>
                  <div
                    class="mt-1 px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 inline-block"
                  >
                    {{ item.category }}
                  </div>
                </div>
              </div>
              <button
                @click.stop="toggleItemVisibility(key)"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  item.visible
                    ? 'text-blue-600 hover:bg-blue-100'
                    : 'text-slate-400 hover:bg-slate-100',
                ]"
              >
                {{ item.visible ? "👁️" : "👁️‍🗨️" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main 3D Viewport -->
      <div class="flex-1 relative">
        <Renderer
          ref="rendererC"
          class="w-full h-full"
          antialias
          :alpha="true"
          :orbit-ctrl="{
            enableDamping: true,
            enablePan: false,
            minDistance: 8,
            maxDistance: 15,
            maxPolarAngle: Math.PI / 2.2,
            minPolarAngle: Math.PI / 6,
          }"
          resize="window"
        >
          <Camera :position="{ x: 0, y: 5, z: 12 }" />
          <Scene>
            <!-- Enhanced Lighting Setup -->
            <AmbientLight :intensity="0.5" />
            <DirectionalLight
              :position="{ x: 10, y: 10, z: 5 }"
              :intensity="0.8"
              :cast-shadow="true"
            />
            <PointLight
              :position="{ x: -5, y: 8, z: 2 }"
              :intensity="0.4"
              color="#ffd700"
            />
            <PointLight
              :position="{ x: 5, y: 3, z: 5 }"
              :intensity="0.3"
              color="#87ceeb"
            />

            <!-- Room Structure with Enhanced Materials -->
            <Plane
              :width="20"
              :height="20"
              :rotation="{ x: -Math.PI / 2 }"
              :position="{ y: -2 }"
              :receive-shadow="true"
            >
              <LambertMaterial color="#f8fafc" />
            </Plane>
            <Plane
              :width="20"
              :height="12"
              :position="{ y: 4, z: -8 }"
              :receive-shadow="true"
            >
              <LambertMaterial color="#f1f5f9" />
            </Plane>
            <Plane
              :width="16"
              :height="12"
              :rotation="{ y: Math.PI / 2 }"
              :position="{ x: -10, y: 4, z: 0 }"
              :receive-shadow="true"
            >
              <LambertMaterial color="#f8fafc" />
            </Plane>
            <Plane
              :width="16"
              :height="12"
              :rotation="{ y: -Math.PI / 2 }"
              :position="{ x: 10, y: 4, z: 0 }"
              :receive-shadow="true"
            >
              <LambertMaterial color="#f8fafc" />
            </Plane>

            <!-- Dynamic Furniture Items with refs for DragControls -->
            <Box
              v-if="roomItems.sofa.visible"
              ref="sofaRef"
              :width="4"
              :height="1.5"
              :depth="2"
              :position="roomItems.sofa.position"
              :rotation="roomItems.sofa.rotation"
              :scale="roomItems.sofa.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('sofa')"
              @pointerover="highlightItem('sofa')"
              @pointerout="unhighlightItem('sofa')"
            >
              <LambertMaterial :color="roomItems.sofa.color" />
            </Box>

            <Box
              v-if="roomItems.coffeeTable.visible"
              ref="coffeeTableRef"
              :width="2"
              :height="0.3"
              :depth="1"
              :position="roomItems.coffeeTable.position"
              :rotation="roomItems.coffeeTable.rotation"
              :scale="roomItems.coffeeTable.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('coffeeTable')"
              @pointerover="highlightItem('coffeeTable')"
              @pointerout="unhighlightItem('coffeeTable')"
            >
              <LambertMaterial :color="roomItems.coffeeTable.color" />
            </Box>

            <Box
              v-if="roomItems.tvStand.visible"
              ref="tvStandRef"
              :width="3"
              :height="0.8"
              :depth="0.8"
              :position="roomItems.tvStand.position"
              :rotation="roomItems.tvStand.rotation"
              :scale="roomItems.tvStand.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('tvStand')"
              @pointerover="highlightItem('tvStand')"
              @pointerout="unhighlightItem('tvStand')"
            >
              <LambertMaterial :color="roomItems.tvStand.color" />
            </Box>

            <Box
              v-if="roomItems.tv.visible"
              ref="tvRef"
              :width="2.5"
              :height="1.5"
              :depth="0.1"
              :position="roomItems.tv.position"
              :rotation="roomItems.tv.rotation"
              :scale="roomItems.tv.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('tv')"
              @pointerover="highlightItem('tv')"
              @pointerout="unhighlightItem('tv')"
            >
              <LambertMaterial :color="roomItems.tv.color" />
            </Box>

            <Cylinder
              v-if="roomItems.lamp.visible"
              ref="lampRef"
              :radius="0.15"
              :height="2"
              :position="roomItems.lamp.position"
              :rotation="roomItems.lamp.rotation"
              :scale="roomItems.lamp.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('lamp')"
              @pointerover="highlightItem('lamp')"
              @pointerout="unhighlightItem('lamp')"
            >
              <LambertMaterial :color="roomItems.lamp.color" />
            </Cylinder>

            <Box
              v-if="roomItems.bookshelf.visible"
              ref="bookshelfRef"
              :width="1.5"
              :height="4"
              :depth="0.8"
              :position="roomItems.bookshelf.position"
              :rotation="roomItems.bookshelf.rotation"
              :scale="roomItems.bookshelf.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('bookshelf')"
              @pointerover="highlightItem('bookshelf')"
              @pointerout="unhighlightItem('bookshelf')"
            >
              <LambertMaterial :color="roomItems.bookshelf.color" />
            </Box>

            <Sphere
              v-if="roomItems.plant.visible"
              ref="plantRef"
              :radius="0.5"
              :position="roomItems.plant.position"
              :rotation="roomItems.plant.rotation"
              :scale="roomItems.plant.scaleVector"
              :receive-shadow="true"
              :cast-shadow="true"
              @click="selectItem('plant')"
              @pointerover="highlightItem('plant')"
              @pointerout="unhighlightItem('plant')"
            >
              <LambertMaterial :color="roomItems.plant.color" />
            </Sphere>
          </Scene>
        </Renderer>

        <!-- 3D Controls Overlay -->
        <div
          class="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-lg p-2 shadow-lg"
        >
          <div class="flex gap-1">
            <button
              @click="resetCamera"
              class="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Reset Camera"
            >
              🔍
            </button>
            <button
              @click="toggleDragControls"
              :class="[
                'p-2 rounded-md transition-colors',
                dragEnabled
                  ? 'text-blue-600 bg-blue-100'
                  : 'text-slate-600 hover:bg-slate-100',
              ]"
              title="Toggle Drag Controls"
            >
              ✋
            </button>
            <button
              class="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        <!-- Performance Stats -->
        <div
          class="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-white text-sm"
        >
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
      </div>

      <!-- Right Sidebar - Item Customization (unchanged) -->
      <div
        :class="[
          'w-96 bg-white/70 backdrop-blur-xl border-l border-slate-200 transition-transform duration-300',
          selectedItem ? 'translate-x-0' : 'translate-x-full',
        ]"
      >
        <div v-if="selectedItem" class="h-full flex flex-col">
          <div class="p-6 border-b border-slate-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-slate-800">
                Customize Item
              </h2>
              <button
                @click="selectedItem = null"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md"
                :style="{ backgroundColor: selectedItemData?.color }"
              >
                {{ selectedItemData?.icon }}
              </div>
              <div>
                <h3 class="font-semibold text-slate-800">
                  {{ selectedItemData?.name }}
                </h3>
                <p class="text-sm text-slate-500">
                  {{ selectedItemData?.description }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Style Variants -->
            <div>
              <h4
                class="font-medium text-slate-800 mb-3 flex items-center gap-2"
              >
                🎨 Style Variants
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="(variant, index) in getItemVariants(selectedItem)"
                  :key="index"
                  @click="applyVariant(selectedItem, variant)"
                  :class="[
                    'cursor-pointer transition-all rounded-lg p-3 text-center border-2',
                    'hover:shadow-md hover:scale-105',
                    isCurrentVariant(selectedItem, variant)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ]"
                >
                  <div
                    class="w-12 h-12 mx-auto mb-2 rounded-lg border-2 border-slate-200 shadow-inner"
                    :style="{ backgroundColor: variant.color }"
                  ></div>
                  <p class="text-sm font-medium text-slate-700">
                    {{ variant.name }}
                  </p>
                  <p class="text-xs text-slate-500">{{ variant.style }}</p>
                  <div
                    class="mt-1 px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 inline-block"
                  >
                    {{ variant.mood }}
                  </div>
                </div>
              </div>
            </div>
            <!-- Transform Controls -->
            <div>
              <h4
                class="font-medium text-slate-800 mb-3 flex items-center gap-2"
              >
                📐 Transform
              </h4>
              <div class="space-y-4">
                <div>
                  <label
                    class="text-sm text-slate-600 mb-2 block flex items-center justify-between"
                  >
                    Scale
                    <span
                      class="font-mono text-xs bg-slate-100 px-2 py-1 rounded"
                      >{{ Math.round(selectedItemData?.scale * 100) }}%</span
                    >
                  </label>
                  <input
                    type="range"
                    :value="selectedItemData?.scale * 100"
                    @input="updateItemScale($event.target.value / 100)"
                    min="50"
                    max="200"
                    step="10"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div class="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50%</span>
                    <span>200%</span>
                  </div>
                </div>
                <div>
                  <label
                    class="text-sm text-slate-600 mb-2 block flex items-center justify-between"
                  >
                    Rotation Y
                    <span
                      class="font-mono text-xs bg-slate-100 px-2 py-1 rounded"
                      >{{
                        Math.round(
                          (selectedItemData?.rotation.y * 180) / Math.PI,
                        )
                      }}°</span
                    >
                  </label>
                  <input
                    type="range"
                    :value="(selectedItemData?.rotation.y * 180) / Math.PI"
                    @input="
                      updateItemRotation(
                        'y',
                        ($event.target.value * Math.PI) / 180,
                      )
                    "
                    min="0"
                    max="360"
                    step="15"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
            <!-- Visibility Toggle -->
            <div
              class="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200"
            >
              <div>
                <p class="font-medium text-slate-800">Visible in Room</p>
                <p class="text-sm text-slate-500">Show or hide this item</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedItemData?.visible"
                  @change="updateItemProperty('visible', $event.target.checked)"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="p-6 border-t border-slate-200 space-y-3">
            <button
              @click="resetItem(selectedItem)"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 flex items-center justify-center gap-2"
            >
              🔄 Reset to Default
            </button>
            <button
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              ✨ Apply Changes
            </button>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center p-6">
          <div class="text-center">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl"
            >
              ⚙️
            </div>
            <h3 class="font-medium text-slate-700 mb-2">No Item Selected</h3>
            <p class="text-sm text-slate-500 max-w-sm">
              Select an item from the library to customize its appearance and
              properties.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar (unchanged) -->
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        class="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-6 py-3 shadow-lg"
      >
        <div class="flex items-center gap-4">
          <button
            @click="resetRoom"
            class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors font-medium flex items-center gap-2"
          >
            🔄 Reset Room
          </button>
          <div class="w-px h-6 bg-slate-300"></div>
          <button
            @click="saveConfiguration"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            💾 Save Design
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from "vue";
import {
  Box,
  Cylinder,
  Sphere,
  Plane,
  Camera,
  LambertMaterial,
  PointLight,
  AmbientLight,
  DirectionalLight,
  Renderer,
  RendererPublicInterface,
  Scene,
} from "troisjs";
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

// Reactive state
const rendererC = ref<RendererPublicInterface>();
const selectedItem = ref<string | null>(null);
const selectedTemplate = ref("modern");
const selectedCategory = ref("all");
const fps = ref(60);
const dragEnabled = ref(false);
const dragControls = ref<DragControls | null>(null);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const originalMaterials = new Map<string, THREE.Material>();

// Enhanced room items with Vector3 for scale
const roomItems = reactive({
  sofa: {
    visible: true,
    position: { x: 0, y: -1.25, z: 2 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#8B4513",
    name: "Modern Sofa",
    category: "furniture",
    icon: "🛋️",
    description: "Comfortable seating for relaxation",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#8B4513",
    },
  },
  coffeeTable: {
    visible: true,
    position: { x: 0, y: -1.85, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#654321",
    name: "Coffee Table",
    category: "furniture",
    icon: "☕",
    description: "Perfect for drinks and magazines",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#654321",
    },
  },
  tvStand: {
    visible: true,
    position: { x: 0, y: -1.6, z: -6 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#2F4F4F",
    name: "TV Stand",
    category: "furniture",
    icon: "📺",
    description: "Sleek entertainment center",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#2F4F4F",
    },
  },
  tv: {
    visible: true,
    position: { x: 0, y: -0.75, z: -5.95 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#000000",
    name: "Smart TV",
    category: "electronics",
    icon: "📱",
    description: "Ultra HD entertainment display",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#000000",
    },
  },
  lamp: {
    visible: true,
    position: { x: 4, y: -0.4, z: 2 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#FFD700",
    name: "Table Lamp",
    category: "lighting",
    icon: "💡",
    description: "Ambient lighting solution",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#FFD700",
    },
  },
  bookshelf: {
    visible: true,
    position: { x: -7, y: 0, z: -2 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#8B4513",
    name: "Bookshelf",
    category: "storage",
    icon: "📚",
    description: "Display your favorite books",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#8B4513",
    },
  },
  plant: {
    visible: true,
    position: { x: 6, y: -1.5, z: -1 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
    scaleVector: { x: 1, y: 1, z: 1 },
    color: "#228B22",
    name: "Decorative Plant",
    category: "decor",
    icon: "🌱",
    description: "Brings life to your space",
    defaultValues: {
      scale: 1,
      rotation: { x: 0, y: 0, z: 0 },
      color: "#228B22",
    },
  },
});

// Item variants and templates (unchanged)
const itemVariants = {
  sofa: [
    {
      name: "Classic Leather",
      color: "#8B4513",
      style: "Traditional",
      mood: "Warm",
    },
    {
      name: "Modern Gray",
      color: "#708090",
      style: "Contemporary",
      mood: "Cool",
    },
    {
      name: "Scandinavian Beige",
      color: "#F5DEB3",
      style: "Nordic",
      mood: "Cozy",
    },
    {
      name: "Statement Navy",
      color: "#1e3a8a",
      style: "Bold",
      mood: "Sophisticated",
    },
    { name: "Velvet Emerald", color: "#059669", style: "Luxury", mood: "Rich" },
    {
      name: "Minimalist White",
      color: "#f8fafc",
      style: "Clean",
      mood: "Fresh",
    },
  ],
  coffeeTable: [
    {
      name: "Dark Walnut",
      color: "#654321",
      style: "Traditional",
      mood: "Warm",
    },
    {
      name: "Glass Modern",
      color: "#e0f2fe",
      style: "Contemporary",
      mood: "Light",
    },
    {
      name: "Industrial Metal",
      color: "#475569",
      style: "Urban",
      mood: "Edgy",
    },
    {
      name: "Marble Luxury",
      color: "#f1f5f9",
      style: "Premium",
      mood: "Elegant",
    },
  ],
  tv: [
    {
      name: "Classic Black",
      color: "#000000",
      style: "Standard",
      mood: "Neutral",
    },
    {
      name: "Premium Silver",
      color: "#cbd5e1",
      style: "Modern",
      mood: "Sleek",
    },
    {
      name: "Curved OLED",
      color: "#1e293b",
      style: "Futuristic",
      mood: "Advanced",
    },
    {
      name: "Art Frame",
      color: "#92400e",
      style: "Decorative",
      mood: "Artistic",
    },
  ],
  lamp: [
    { name: "Warm Amber", color: "#f59e0b", style: "Cozy", mood: "Relaxing" },
    { name: "Cool White", color: "#f8fafc", style: "Modern", mood: "Crisp" },
    {
      name: "Vintage Brass",
      color: "#d97706",
      style: "Retro",
      mood: "Nostalgic",
    },
    { name: "RGB Smart", color: "#ec4899", style: "Tech", mood: "Dynamic" },
  ],
  plant: [
    { name: "Fiddle Leaf", color: "#16a34a", style: "Tropical", mood: "Fresh" },
    {
      name: "Orchid Bloom",
      color: "#c084fc",
      style: "Elegant",
      mood: "Delicate",
    },
    { name: "Desert Cactus", color: "#65a30d", style: "Minimal", mood: "Zen" },
    {
      name: "Bamboo Grove",
      color: "#84cc16",
      style: "Asian",
      mood: "Peaceful",
    },
  ],
  tvStand: [
    { name: "Dark Slate", color: "#2F4F4F", style: "Modern", mood: "Sleek" },
    {
      name: "Wooden Oak",
      color: "#8B4513",
      style: "Traditional",
      mood: "Warm",
    },
    {
      name: "White Gloss",
      color: "#f8fafc",
      style: "Contemporary",
      mood: "Clean",
    },
    {
      name: "Industrial Steel",
      color: "#475569",
      style: "Urban",
      mood: "Edgy",
    },
  ],
  bookshelf: [
    {
      name: "Rustic Wood",
      color: "#8B4513",
      style: "Traditional",
      mood: "Warm",
    },
    {
      name: "White Modern",
      color: "#f8fafc",
      style: "Contemporary",
      mood: "Clean",
    },
    {
      name: "Black Metal",
      color: "#1e293b",
      style: "Industrial",
      mood: "Bold",
    },
    {
      name: "Walnut Premium",
      color: "#654321",
      style: "Luxury",
      mood: "Elegant",
    },
  ],
};

const templates = {
  modern: {
    name: "Modern Minimalist",
    theme: "Clean lines, neutral colors",
    icon: "🏢",
    config: {
      sofa: { color: "#708090", visible: true },
      coffeeTable: { color: "#e0f2fe", visible: true },
      tvStand: { color: "#f1f5f9", visible: true },
      tv: { color: "#cbd5e1", visible: true },
      lamp: { color: "#f8fafc", visible: true },
      bookshelf: { color: "#f1f5f9", visible: true },
      plant: { color: "#16a34a", visible: true },
    },
  },
  cozy: {
    name: "Cozy Sanctuary",
    theme: "Warm tones, comfortable vibes",
    icon: "🏠",
    config: {
      sofa: { color: "#F5DEB3", visible: true },
      coffeeTable: { color: "#654321", visible: true },
      tvStand: { color: "#8B4513", visible: false },
      tv: { color: "#000000", visible: false },
      lamp: { color: "#f59e0b", visible: true },
      bookshelf: { color: "#8B4513", visible: true },
      plant: { color: "#c084fc", visible: true },
    },
  },
  luxury: {
    name: "Luxury Lounge",
    theme: "Premium materials, rich colors",
    icon: "✨",
    config: {
      sofa: { color: "#059669", visible: true },
      coffeeTable: { color: "#f1f5f9", visible: true },
      tvStand: { color: "#475569", visible: true },
      tv: { color: "#1e293b", visible: true },
      lamp: { color: "#ec4899", visible: true },
      bookshelf: { color: "#654321", visible: true },
      plant: { color: "#84cc16", visible: true },
    },
  },
};

// Categories for filtering
const categories = computed(() => {
  const cats = new Set<string>(["all"]);
  Object.values(roomItems).forEach((item) => cats.add(item.category));
  return Array.from(cats);
});

// Computed properties
const filteredItems = computed(() => {
  if (selectedCategory.value === "all") {
    return roomItems;
  }
  return Object.fromEntries(
    Object.entries(roomItems).filter(
      ([_, item]) => item.category === selectedCategory.value,
    ),
  );
});

const visibleItemsCount = computed(() => {
  return Object.values(roomItems).filter((item) => item.visible).length;
});

const totalItemsCount = computed(() => {
  return Object.keys(roomItems).length;
});

const selectedItemData = computed(() => {
  return selectedItem.value
    ? roomItems[selectedItem.value as keyof typeof roomItems]
    : null;
});

const getItemVariants = (itemKey: string) => {
  return itemVariants[itemKey as keyof typeof itemVariants] || [];
};

const isCurrentVariant = (itemKey: string, variant: { color: string }) => {
  return roomItems[itemKey as keyof typeof roomItems]?.color === variant.color;
};

// Methods
const applyTemplate = () => {
  const template = templates[selectedTemplate.value];
  if (!template) return;

  Object.entries(template.config).forEach(([key, config]) => {
    const item = roomItems[key as keyof typeof roomItems];
    if (item) {
      item.color = config.color;
      item.visible = config.visible;
      item.scale = item.defaultValues.scale;
      item.scaleVector = { x: item.scale, y: item.scale, z: item.scale };
      item.rotation = { ...item.defaultValues.rotation };
    }
  });
};

const selectItem = (key: string) => {
  selectedItem.value = key;
};

const toggleItemVisibility = (key: string) => {
  const item = roomItems[key as keyof typeof roomItems];
  if (item) {
    item.visible = !item.visible;
  }
};

const applyVariant = (itemKey: string, variant: { color: string }) => {
  const item = roomItems[itemKey as keyof typeof roomItems];
  if (item) {
    item.color = variant.color;
  }
};

const updateItemScale = (value: number) => {
  if (selectedItem.value) {
    const item = roomItems[selectedItem.value as keyof typeof roomItems];
    if (item) {
      item.scale = value;
      item.scaleVector = { x: value, y: value, z: value };
    }
  }
};

const updateItemProperty = (property: "visible", value: boolean) => {
  if (selectedItem.value) {
    const item = roomItems[selectedItem.value as keyof typeof roomItems];
    if (item && property === "visible") {
      item.visible = value;
    }
  }
};

const updateItemRotation = (axis: "y", value: number) => {
  if (selectedItem.value) {
    const item = roomItems[selectedItem.value as keyof typeof roomItems];
    if (item) {
      item.rotation[axis] = value;
    }
  }
};

const resetItem = (itemKey: string) => {
  const item = roomItems[itemKey as keyof typeof roomItems];
  if (item) {
    item.scale = item.defaultValues.scale;
    item.scaleVector = { x: item.scale, y: item.scale, z: item.scale };
    item.rotation = { ...item.defaultValues.rotation };
    item.color = item.defaultValues.color;
    item.visible = true;
  }
};

const resetRoom = () => {
  Object.entries(roomItems).forEach(([key, item]) => {
    item.scale = item.defaultValues.scale;
    item.scaleVector = { x: item.scale, y: item.scale, z: item.scale };
    item.rotation = { ...item.defaultValues.rotation };
    item.color = item.defaultValues.color;
    item.visible = true;
  });
  selectedTemplate.value = "modern";
  applyTemplate();
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
        },
      ]),
    ),
  };
  console.log("Saving configuration:", JSON.stringify(config, null, 2));
  alert("Design saved! Check console for configuration.");
};

const resetCamera = () => {
  if (rendererC.value?.orbitControls) {
    rendererC.value.orbitControls.reset();
    rendererC.value.orbitControls.target.set(0, 0, 0);
    rendererC.value.orbitControls.update();
  }
};

const toggleDragControls = () => {
  dragEnabled.value = !dragEnabled.value;
  if (dragControls.value) {
    dragControls.value.enabled = dragEnabled.value;
  }
};

const highlightItem = (itemKey: string) => {
  const ref = refs[`${itemKey}Ref`];
  if (ref && ref.three) {
    const mesh = ref.three;
    originalMaterials.set(itemKey, mesh.material.clone());
    mesh.material = new THREE.MeshLambertMaterial({
      color: roomItems[itemKey as keyof typeof roomItems].color,
      emissive: "#00ff00",
      emissiveIntensity: 0.3,
    });
  }
};

const unhighlightItem = (itemKey: string) => {
  const ref = refs[`${itemKey}Ref`];
  if (ref && ref.three && originalMaterials.has(itemKey)) {
    ref.three.material = originalMaterials.get(itemKey);
    originalMaterials.delete(itemKey);
  }
};

// Setup DragControls and Raycasting
const refs = ref<Record<string, any>>({});
onMounted(() => {
  const renderer = rendererC.value?.renderer;
  const scene = rendererC.value?.scene;
  const camera = rendererC.value?.camera;
  if (renderer && scene && camera) {
    // Initialize DragControls
    const draggableObjects = Object.keys(roomItems)
      .filter((key) => roomItems[key as keyof typeof roomItems].visible)
      .map((key) => refs[`${key}Ref`]?.three)
      .filter((obj) => obj);
    dragControls.value = new DragControls(
      draggableObjects,
      camera,
      renderer.domElement,
    );
    dragControls.value.enabled = dragEnabled.value;

    // Update position on drag
    dragControls.value.addEventListener("drag", (event) => {
      const object = event.object;
      const key = Object.keys(roomItems).find(
        (k) => refs[`${k}Ref`]?.three === object,
      );
      if (key) {
        const item = roomItems[key as keyof typeof roomItems];
        item.position = {
          x: object.position.x,
          y: object.position.y,
          z: object.position.z,
        };
      }
    });

    // Raycasting for clicking
    const onClick = (event: MouseEvent) => {
      if (dragEnabled.value) return; // Disable clicking when dragging
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(draggableObjects);
      if (intersects.length > 0) {
        const key = Object.keys(roomItems).find(
          (k) => refs[`${k}Ref`]?.three === intersects[0].object,
        );
        if (key) {
          selectItem(key);
        }
      }
    };
    window.addEventListener("click", onClick);

    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener("click", onClick);
      if (dragControls.value) {
        dragControls.value.dispose();
      }
    });

    // FPS counter
    const updateFPS = () => {
      fps.value = Math.round(
        rendererC.value?.renderer.info.render.frameRate || 60,
      );
      requestAnimationFrame(updateFPS);
    };
    updateFPS();

    // Watch for visibility changes to update draggable objects
    watch(
      () => Object.values(roomItems).map((item) => item.visible),
      () => {
        if (dragControls.value) {
          dragControls.value.dispose();
          const draggableObjects = Object.keys(roomItems)
            .filter((key) => roomItems[key as keyof typeof roomItems].visible)
            .map((key) => refs[`${key}Ref`]?.three)
            .filter((obj) => obj);
          dragControls.value = new DragControls(
            draggableObjects,
            camera,
            renderer.domElement,
          );
          dragControls.value.enabled = dragEnabled.value;
          dragControls.value.addEventListener("drag", (event) => {
            const object = event.object;
            const key = Object.keys(roomItems).find(
              (k) => refs[`${k}Ref`]?.three === object,
            );
            if (key) {
              const item = roomItems[key as keyof typeof roomItems];
              item.position = {
                x: object.position.x,
                y: object.position.y,
                z: object.position.z,
              };
            }
          });
        }
      },
    );
  }
});
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
