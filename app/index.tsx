import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GRID_SIZE = 20;
const CELL_SIZE = Dimensions.get('window').width / GRID_SIZE;
const GAME_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Segment = { x: number; y: number };

export default function HomeScreen() {
  const [snake, setSnake] = useState<Segment[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Segment>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate random food position
  const generateFood = (snakeSegments: Segment[]): Segment => {
    let newFood: Segment = { x: 0, y: 0 };
    let isValidPosition = false;

    while (!isValidPosition) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isValidPosition = !snakeSegments.some((segment: Segment) => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood;
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake: Segment[]) => {
        const head = prevSnake[0];
        let newHead: Segment = { x: 0, y: 0 };

        // Determine next head position
        switch (nextDirection) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment: Segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        // Update direction for next move
        setDirection(nextDirection);

        let newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev: number) => prev + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, nextDirection, food]);

  const handleDirectionChange = (newDirection: Direction) => {
    // Prevent 180-degree turns
    const oppositeDirections: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    const currentDirection: Direction = direction;
    if (oppositeDirections[currentDirection] !== newDirection) {
      setNextDirection(newDirection);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Snake Game</Text>
          <Text style={styles.score}>Score: {score}</Text>
        </View>

        <View style={styles.gameBoard}>
          {/* Grid background */}
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.gridCell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderColor: (x + y) % 2 === 0 ? '#f0f0f0' : '#fafafa',
                  },
                ]}
              />
            ))
          )}

          {/* Food */}
          <View
            style={[
              styles.food,
              {
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
          />

          {/* Snake */}
          {snake.map((segment: Segment, index: number) => (
            <View
              key={index}
              style={[
                styles.snakeSegment,
                {
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  backgroundColor: index === 0 ? '#2ecc71' : '#27ae60',
                },
              ]}
            />
          ))}
        </View>

        {gameOver && (
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.gameOverText}>Game Over!</Text>
              <Text style={styles.finalScore}>Final Score: {score}</Text>
              <TouchableOpacity style={styles.button} onPress={startGame}>
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.controls}>
          {!gameStarted && !gameOver && (
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          )}

          {gameStarted && !gameOver && (
            <View style={styles.dPad}>
              <TouchableOpacity
                style={[styles.dPadButton, styles.dPadUp]}
                onPress={() => handleDirectionChange('UP')}
              >
                <Text style={styles.dPadText}>▲</Text>
              </TouchableOpacity>

              <View style={styles.dPadRow}>
                <TouchableOpacity
                  style={[styles.dPadButton, styles.dPadSide]}
                  onPress={() => handleDirectionChange('LEFT')}
                >
                  <Text style={styles.dPadText}>◄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dPadButton, styles.dPadSide]}
                  onPress={() => handleDirectionChange('DOWN')}
                >
                  <Text style={styles.dPadText}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dPadButton, styles.dPadSide]}
                  onPress={() => handleDirectionChange('RIGHT')}
                >
                  <Text style={styles.dPadText}>►</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {gameStarted && (
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetGame}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  score: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  gameBoard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#34495e',
    margin: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridCell: {
    position: 'absolute',
    borderWidth: 0.5,
  },
  food: {
    position: 'absolute',
    backgroundColor: '#e74c3c',
    borderRadius: CELL_SIZE / 2,
  },
  snakeSegment: {
    position: 'absolute',
    borderRadius: 2,
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#2ecc71',
  },
  resetButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dPad: {
    alignItems: 'center',
    gap: 8,
  },
  dPadUp: {
    alignSelf: 'center',
  },
  dPadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dPadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadSide: {
    width: 60,
    height: 60,
  },
  dPadText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 24,
  },
});